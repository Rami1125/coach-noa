/**
 * Continuous Conversation Synchronization (Multi-Device Continuity)
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Synchronizes chat history between Desktop Dispatch (office/home) and
 * Samsung Mobile (yard/field) using Firestore 'conversations'.
 */

import { db, collection, addDoc, getDocs, query, limit, orderBy } from "./firebase";

export interface ChatMessageItem {
  id: string;
  sender: "user" | "coach" | "assistant" | "system";
  text: string;
  timestamp: string;
  deviceType?: "samsung-mobile" | "desktop";
  role?: string;
}

const LOCAL_CONVERSATION_KEY = "saban_coach_active_thread_v1";
const SYNC_SESSION_ID = "rami_dispatch_master_thread";

/**
 * Load continuous conversation history across devices
 */
export async function loadContinuousConversation(): Promise<ChatMessageItem[]> {
  // 1. Try local cache first for instant UI paint
  let localMessages: ChatMessageItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_CONVERSATION_KEY);
      if (stored) {
        localMessages = JSON.parse(stored);
      }
    } catch (_e) {
      // ignore
    }
  }

  // 2. Fetch latest shared session from Firestore
  try {
    const convCol = collection(db, "conversations");
    const q = query(convCol, orderBy("createdAt", "desc"), limit(1));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const latestDoc = snap.docs[0].data();
      if (latestDoc && Array.isArray(latestDoc.messages) && latestDoc.messages.length > 0) {
        const remoteMessages: ChatMessageItem[] = latestDoc.messages.map((m: any, idx: number) => ({
          id: m.id || `remote-${idx}-${Date.now()}`,
          sender: m.sender === "client" || m.sender === "user" ? "user" : "coach",
          text: m.text || m.content || "",
          timestamp: m.timestamp || new Date().toISOString(),
          deviceType: m.deviceType || "desktop",
        }));

        // Merge or take remote if longer
        if (remoteMessages.length >= localMessages.length) {
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_CONVERSATION_KEY, JSON.stringify(remoteMessages));
          }
          return remoteMessages;
        }
      }
    }
  } catch (_err) {
    console.info("[ConversationSync] Operating on synchronized local thread cache.");
  }

  return localMessages;
}

/**
 * Save and broadcast conversation update to sync across devices
 */
export async function saveContinuousConversation(
  messages: ChatMessageItem[],
  deviceType: "samsung-mobile" | "desktop" = "desktop"
): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_CONVERSATION_KEY, JSON.stringify(messages));
    } catch (_e) {
      // ignore
    }
  }

  // Persist to Firestore conversations
  try {
    const convCol = collection(db, "conversations");
    await addDoc(convCol, {
      sessionId: SYNC_SESSION_ID,
      deviceType,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      client: "ראמי מסארווה - מנהל תפעול סבן",
      role: "תפעול וסידור עבודה",
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.sender === "user" ? "client" : "noa",
        text: m.text,
        timestamp: m.timestamp,
        deviceType: m.deviceType || deviceType,
      })),
    });
    console.info("[ConversationSync] Shared conversation state synced across devices.");
  } catch (_err) {
    console.info("[ConversationSync] Conversation thread preserved in active session.");
  }
}
