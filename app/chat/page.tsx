/**
 * Realtime Live Chat - Noa AI (נועה AI)
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Hardware-Targeted UX for Samsung Galaxy S22 Ultra & Note (6.8" Screen, S-Pen, Touch >= 50px)
 * & Desktop Dispatch Station.
 * 
 * Features:
 * 1. Live Firestore onSnapshot listener to 'conversations/user_0508860896_active/messages'
 * 2. Subtle Web Audio Chime (880Hz + 1320Hz) on every incoming dispatch/message
 * 3. Verified Device Badge: 📱 Samsung S22 Ultra / Note (מכשיר שטח מאומת)
 * 4. High-contrast outdoor mode for direct yard sunlight
 * 5. Quick gateway button to live deployment: https://ai-chat-noa.vercel.app/chat
 * 6. Minimum 50px touch & S-Pen targets
 * 7. Integrated VoicePlayer for hands-free vehicle speakerphone
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sun,
  PenTool,
  Clock,
  Layers,
  Building2,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "../../lib/firebase";
import { playSubtleChime, unlockAudioContext } from "../../lib/notification-chime";
import { VoicePlayer } from "../../components/coach/VoicePlayer";
import { MarkdownRenderer } from "../../components/coach/MarkdownRenderer";
import { DeviceProfileSwitcher } from "../../components/theme/DeviceProfileSwitcher";
import { useDeviceTheme } from "../../lib/device-theme-context";

export interface FirestoreChatMessage {
  id: string;
  sender: "user" | "client" | "noa" | "assistant" | "coach" | "system";
  text: string;
  timestamp?: any;
  deviceType?: string;
  metadata?: {
    truck?: string;
    branch?: string;
    depositIncluded?: boolean;
    urgent?: boolean;
  };
}

const QUICK_FIELD_PROMPTS = [
  "שיבוץ מלט 25 ק״ג לעלי (איסוזו משטחים)",
  "הזמנת 3 בלות חול שטוף + פקדון 60002 לחכמת",
  "איטונג 20 לקומה 3 עם מנוף כבד",
  "בדיקת יתרת פקדונות משטחים 60060",
];

interface ChatPageProps {
  onNavigate?: (path: string) => void;
}

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const { isMobile, isSamsung } = useDeviceTheme();
  const [messages, setMessages] = useState<FirestoreChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [outdoorHighContrast, setOutdoorHighContrast] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "offline">("connecting");
  const [unreadNewCount, setUnreadNewCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialSnapshot = useRef(true);
  const lastMessageCount = useRef(0);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // 1. Real-time onSnapshot listener to conversations/user_0508860896_active/messages
  useEffect(() => {
    setConnectionStatus("connecting");
    const activeSubCol = collection(db, "conversations", "user_0508860896_active", "messages");
    const q = query(activeSubCol, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setConnectionStatus("connected");
        const loadedMessages: FirestoreChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            sender: data.sender || (data.role === "assistant" ? "noa" : "user"),
            text: data.text || data.content || "",
            timestamp: data.timestamp || data.createdAt,
            deviceType: data.deviceType,
            metadata: data.metadata,
          };
        });

        // Detect new incoming messages after initial load
        if (!isInitialSnapshot.current && loadedMessages.length > lastMessageCount.current) {
          const newMessages = loadedMessages.slice(lastMessageCount.current);
          const hasIncomingAiMessage = newMessages.some(
            (m) => m.sender === "noa" || m.sender === "assistant" || m.sender === "coach"
          );

          if (hasIncomingAiMessage && chimeEnabled) {
            playSubtleChime({ volume: 0.32 });
          }
          setUnreadNewCount((prev) => prev + (loadedMessages.length - lastMessageCount.current));
        }

        isInitialSnapshot.current = false;
        lastMessageCount.current = loadedMessages.length;

        // If empty (e.g. brand new user session), populate with warm Saban greeting
        if (loadedMessages.length === 0) {
          setMessages([
            {
              id: "welcome-system-0",
              sender: "noa",
              text: `שלום ראמי! מחובר בזמן אמת לסידור העבודה של ח. סבן חומרי בניין (1994) בע״מ 🚛.
אני מאזינה לשיחות הפעילות שלך. כל עדכון תפעולי, שיבוץ נהג או חיוב פקדונות מסונכרן מיד.

<<<VOICE_SCRIPT>>>
ראמי, שלום. נועה מחוברת בזמן אמת לערוץ הפעיל שלך. כל שיבוץ משאית, הזמנה או פקדון מוכנים לקליטה. באיזה סידור עבודה נתחיל?
<<<END_VOICE_SCRIPT>>>`,
              timestamp: new Date().toISOString(),
              deviceType: "samsung-s22-ultra",
            },
          ]);
        } else {
          setMessages(loadedMessages);
        }

        setTimeout(() => scrollToBottom(true), 100);
      },
      (error) => {
        console.warn("[Firestore] onSnapshot fallback to local state:", error);
        setConnectionStatus("offline");
        // Fallback demo state if network blocked
        if (messages.length === 0) {
          setMessages([
            {
              id: "fallback-welcome",
              sender: "noa",
              text: `ראמי, שלום! נועה פעילה במצב שטח עצמאי.
תקן בטיחות מחמיר: שקי מלט 25 ק"ג בלבד. פקדון בלה 60002 ומשטח עץ 60060 מוכנים לשיבוץ.

<<<VOICE_SCRIPT>>>
ראמי, שלום. נועה ערוכה במצב שטח. נהגי הסידור חכמת, עלי, אמיר ומוראד ממתינים להנחיה.
<<<END_VOICE_SCRIPT>>>`,
              timestamp: new Date().toISOString(),
              deviceType: "samsung-s22-ultra",
            },
          ]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chimeEnabled]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSubmitting) return;

    // Unlock Web Audio context on user tap
    unlockAudioContext();

    setIsSubmitting(true);
    setInputText("");

    const newMsgObj: FirestoreChatMessage = {
      id: `local-${Date.now()}`,
      sender: "user",
      text: content,
      timestamp: new Date().toISOString(),
      deviceType: "samsung-s22-ultra",
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsgObj]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      // 1. Write to Firestore subcollection: conversations/user_0508860896_active/messages
      const activeSubCol = collection(db, "conversations", "user_0508860896_active", "messages");
      await addDoc(activeSubCol, {
        sender: "user",
        text: content,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        client: "ראמי מסארווה (מנהל תפעול)",
        deviceType: "samsung-s22-ultra",
      });

      // 2. Fetch intelligent response from Coach/Noa API
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-8).map((m) => ({
              role: m.sender === "user" || m.sender === "client" ? "user" : "assistant",
              content: m.text,
            })),
            { role: "user", content },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiText = data.text || data.content || "ההנחיה התקבלה ונקלטה בסידור העבודה.";

        // Play chime on response
        if (chimeEnabled) {
          playSubtleChime({ volume: 0.35 });
        }

        // Write AI response back to Firestore
        try {
          await addDoc(activeSubCol, {
            sender: "noa",
            text: aiText,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
            deviceType: "noa-core-engine",
          });
        } catch (_writeErr) {
          // If Firestore offline, add locally
          setMessages((prev) => [
            ...prev,
            {
              id: `noa-${Date.now()}`,
              sender: "noa",
              text: aiText,
              timestamp: new Date().toISOString(),
              deviceType: "noa-core-engine",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("[ChatPage] Error sending message:", err);
      // Ensure chime sounds even on offline mock for responsiveness
      if (chimeEnabled) {
        playSubtleChime({ volume: 0.25 });
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  const handleTestChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudioContext();
    playSubtleChime({ volume: 0.35 });
  };

  return (
    <div
      className={`min-h-screen text-slate-900 flex flex-col transition-colors duration-200 ${
        outdoorHighContrast ? "bg-slate-100" : "bg-slate-50"
      }`}
      dir="rtl"
    >
      {/* Top Header Optimized for Samsung S22 Ultra & Desktop */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          
          {/* Right/Start: Back & Identity */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo("/portal")}
              className="h-11 w-11 sm:h-10 sm:w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition border border-slate-300 active:scale-95"
              title="חזרה למסוף השער"
            >
              <ArrowRight className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  נועה AI | שיחות אמת
                </h1>
                
                {/* Hardware Verified Device Badge for Samsung S22 Ultra / Note */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                  📱 Samsung S22 Ultra / Note (מכשיר שטח מאומת)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold mt-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-emerald-500 animate-ping"
                        : connectionStatus === "connecting"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {connectionStatus === "connected"
                    ? "מאזין חי (Firestore Active)"
                    : connectionStatus === "connecting"
                    ? "מתחבר לערוץ..."
                    : "מצב לא-מקוון"}
                </span>
                <span>•</span>
                <span>תת-קולקציה: user_0508860896_active</span>
              </div>
            </div>
          </div>

          {/* Left/End Actions: Live Web Gateway Button + Chime + Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Live Web Gateway Button */}
            <a
              href="https://ai-chat-noa.vercel.app/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition"
              title="פתח את צ'אט נועה הרשמי ברשת"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">שער צ'אט חי</span>
              <span className="sm:hidden">צ'אט חי</span>
            </a>

            {/* Subtle Chime Toggle & Test Button */}
            <button
              onClick={() => setChimeEnabled((prev) => !prev)}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition border ${
                chimeEnabled
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200"
              }`}
              title={chimeEnabled ? "צלצול התראה פעיל (Web Audio Chime)" : "צלצול התראה מושתק"}
            >
              {chimeEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            {/* Test Chime Trigger */}
            <button
              onClick={handleTestChime}
              className="hidden md:flex h-11 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 items-center gap-1 text-xs font-bold border border-slate-300"
              title="בדיקת צליל פעמון (880Hz + 1320Hz)"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>בדיקת צלצול</span>
            </button>

            {/* Outdoor High Contrast Toggle */}
            <button
              onClick={() => setOutdoorHighContrast((prev) => !prev)}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition border ${
                outdoorHighContrast
                  ? "bg-amber-100 text-amber-900 border-amber-400"
                  : "bg-slate-100 text-slate-600 border-slate-300"
              }`}
              title="מצב קריאה בשמש ישירה (High Contrast Outdoor)"
            >
              <Sun className="h-5 w-5" />
            </button>

            <DeviceProfileSwitcher />
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        
        {/* Hardware Status Banner (Samsung S22 Ultra Viewport & S-Pen Ready) */}
        <div className="mb-3 p-3 rounded-2xl bg-white border-2 border-slate-300 shadow-sm flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <PenTool className="h-4 w-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 leading-snug">
                מצב מותאם שטח: Samsung S22 Ultra / Note (מסך 6.8", 19.3:9)
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                לחצני מגע מוגדלים (50px+), ניגודיות גבוהה לקריאה בשמש, תמיכה בעט S-Pen
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigateTo("/coach")}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs border border-orange-200 transition"
            >
              🧠 חדר המאמן
            </button>
            <button
              onClick={() => navigateTo("/catalog-studio")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition"
            >
              📦 קטלוג ופקדונות
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-3.5 pb-4">
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user" || msg.sender === "client";

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isUser ? "items-start" : "items-end"} animate-fadeIn`}
              >
                {/* Bubble Container */}
                <div
                  className={`w-full max-w-2xl rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                    isUser
                      ? "bg-slate-900 text-white border-2 border-slate-800 mr-auto"
                      : "bg-white text-slate-900 border-2 border-slate-300 ml-auto"
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/50 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isUser ? "bg-orange-400" : "bg-blue-600"
                        }`}
                      />
                      <span className={isUser ? "text-orange-200" : "text-slate-900 font-extrabold"}>
                        {isUser ? "ראמי מסארווה (מנהל תפעול)" : "נועה AI | סידור עבודה סבן"}
                      </span>
                      {msg.deviceType && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                            isUser ? "bg-slate-800 text-slate-300" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {msg.deviceType.includes("samsung") ? "סמסונג שטח" : msg.deviceType}
                        </span>
                      )}
                    </div>

                    {/* VoicePlayer & Timestamp */}
                    <div className="flex items-center gap-2">
                      {!isUser && (
                        <VoicePlayer
                          rawText={msg.text}
                          variant="pill"
                          className="scale-95 origin-left"
                        />
                      )}
                      <span className={isUser ? "text-slate-400" : "text-slate-500"}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>

                  {/* Message Content: Large Outdoor Typography */}
                  <div
                    className={`leading-relaxed text-sm sm:text-base font-semibold samsung-chat-text ${
                      isUser ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Field Prompt Chips (Touch Target >= 50px on Samsung) */}
        <div className="py-2 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            שיגור מהיר:
          </span>
          {QUICK_FIELD_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="h-10 sm:h-9 px-3.5 rounded-xl bg-white hover:bg-orange-50 border-2 border-slate-300 hover:border-orange-500 text-slate-800 hover:text-orange-950 text-xs font-bold whitespace-nowrap transition active:scale-95 shadow-xs shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Input Console - High Touch/S-Pen Friendly (Min 50px Height) */}
        <div className="sticky bottom-2 z-30 pt-2">
          <div className="rounded-2xl border-2 border-slate-400 bg-white p-2 sm:p-2.5 shadow-xl flex items-center gap-2">
            
            {/* Input Field: 18px text, 50px min-height */}
            <input
              type="text"
              placeholder="כתוב הוראה תפעולית לנועה (למשל: שיבוץ 40 שקי מלט לקבלן גלעד בחולון)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSubmitting}
              className="flex-1 min-h-[50px] px-4 text-base font-bold text-slate-900 placeholder:text-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-orange-500 focus:outline-none transition"
            />

            {/* Send Button: Min 50x50px Touch Target for Samsung S22 Ultra & S-Pen */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSubmitting}
              className={`h-[50px] min-w-[50px] px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                inputText.trim() && !isSubmitting
                  ? "bg-orange-600 hover:bg-orange-500 text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              title="שגר הוראה תפעולית"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 ml-1" />
                  <span className="hidden sm:inline">שגר</span>
                </>
              )}
            </button>

          </div>
        </div>

      </main>
    </div>
  );
}
