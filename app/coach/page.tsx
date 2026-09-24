"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Eye, 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Check, 
  Terminal, 
  CornerDownLeft,
  Building2,
  FileQuestion,
  UserCheck
} from "lucide-react";
import { PromptCard } from "../../components/coach/PromptCard";
import { MirrorCard } from "../../components/coach/MirrorCard";
import { parseCoachResponse } from "../../src/lib/coach-parser";

interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const QUICK_PROMPTS = [
  {
    id: "complex_order",
    label: "חידוד פקודה להזמנה מורכבת",
    icon: Sparkles,
    prompt: "יש לי הזמנה דחופה של 80 שקי מלט, 4 בלות חול ושני משטחי בלוקים 20 לאתר צפוף ברחוב רוטשילד בראשון לציון לקומה 3. איך לנסח את זה לנועה בדיוק כדי שלא יהיו פאשלות?"
  },
  {
    id: "new_field_rule",
    label: "איך ללמד את נועה כלל שטח חדש",
    icon: ShieldCheck,
    prompt: "אני רוצה שנועה תלמד כלל קבוע: לקוחות מזומן של ח. סבן לא מקבלים אישור יציאת משאית מהסניף בלי חתימה של ורד או הראל על תעודת התשלום."
  },
  {
    id: "role_simulation",
    label: "סימולציית שיחה מול ורד / הראל",
    icon: UserCheck,
    prompt: "איך נועה צריכה להעביר לוורד (גבייה) ולהראל (מנהל סניף) התרעה על לקוח שרוצה אספקה דחופה באשראי חורג?"
  },
  {
    id: "blind_spots",
    label: "איתור נקודות עיוורון בסידור",
    icon: Eye,
    prompt: "תבדוק לי את הניסוח הבא ותגיד לי איפה נועה עלולה לטעות: 'תוציא מחר לחכמת מנוף ב-07:00 בבוקר לפריקה בתל אביב 5 בלות חול ו-100 שקי מלט'."
  },
  {
    id: "friday_crane_ban",
    label: "איסור פריקות מנוף בשישי (חכמת)",
    icon: Zap,
    prompt: "קבלן מבקש אספקה ביום שישי בבוקר עם מנוף כבד. איך נועה צריכה לבלום את זה ולהציע לו חלופה לפי נוהל סבן?"
  },
  {
    id: "deposit_compliance",
    label: "בדיקת חוקי פקדונות 60002 ו-60060",
    icon: Terminal,
    prompt: "איך לוודא שנועה לעולם לא מפספסת הוספת פקדון בלה 60002 על כל שק בלה ופקדון משטח 60060 על כל 40 שקי מלט 25 ק\"ג?"
  }
];

export default function CoachStudioPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "coach",
      content: `שלום ראמי! אני **המאמן הלוגיסטי ומהנדס ה-Prompt של ח. סבן חומרי בניין (1994) בע״מ** 🧠.

תפקידי לשמש כ**משקפת תפעולית (The Operational Mirror)** עבורך:
1. נקשיב למה שאתה רוצה לתאם או ללמד את נועה.
2. אחדד מולך בשאלות מנחות מה חסר (סוג פריקה, משקלים, נהג, פקדונות).
3. אציג לך בזמן אמת השוואה של "איך נועה עלולה לטעות בניסוח חופשי ⬅️ איך לנסח במדויק לפי ה-DNA של סבן".
4. אנפק לך **כרטיס פקודה סופי מלוטש (Master Prompt)** להעתקה בלחיצה אחת.

בחר באחד מכפתורי החידוד המהירים למטה, או כתוב לי מה עומד על הפרק בסידור העבודה.`,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "mirror_archive">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    };

    const coachPlaceholderId = `coach-${Date.now()}`;
    const initialCoachMsg: ChatMessage = {
      id: coachPlaceholderId,
      role: "coach",
      content: "",
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true
    };

    // Prepare history for API
    const historyPayload = messages
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

    setMessages((prev) => [...prev, userMsg, initialCoachMsg]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      // Send stream request to /api/coach/chat
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.replace("data: ", "");
              if (dataStr === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === coachPlaceholderId
                        ? { ...msg, content: accumulatedText, isStreaming: true }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  accumulatedText = `הערת מערכת: ${parsed.error}`;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === coachPlaceholderId
                        ? { ...msg, content: accumulatedText, isStreaming: false }
                        : msg
                    )
                  );
                }
              } catch (_e) {
                // Raw text chunk fallback
                accumulatedText += dataStr;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === coachPlaceholderId
                      ? { ...msg, content: accumulatedText, isStreaming: true }
                      : msg
                  )
                );
              }
            }
          }
        }

        // Finalize streaming
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === coachPlaceholderId
              ? { 
                  ...msg, 
                  content: accumulatedText.trim() || "פנייתך נקלטה במאמן נועה. נסה לשאול שוב או לבחור באחת הפקודות המהירות למעלה.", 
                  isStreaming: false 
                }
              : msg
          )
        );
      } else {
        // Fallback for non-streaming response
        const data = await response.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === coachPlaceholderId
              ? { ...msg, content: data.text || "לא התקבלה תשובה מהמאמן", isStreaming: false }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.info("[Coach Chat Notice]:", err?.message || err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === coachPlaceholderId
            ? {
                ...msg,
                content: `⚠️ עדכון תפעולי: שרתי ה-AI מתעדכנים כעת. אנא לחץ שוב על שליחה או בחר פקודה מוכנה.`,
                isStreaming: false
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPromptInInput = (promptText: string) => {
    setInputPrompt(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("האם לאפס את שיחת המאמן ולהתחיל סשן חדש?")) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "coach",
          content: "סשן חדש נפתח. מה תרצה שנתרגל או נחדד כעת עבור נועה AI?",
          timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Rubik',sans-serif] text-right" dir="rtl">
      
      {/* Top Studio Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Persona Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  חדר המאמן והמשקפת של נועה
                </h1>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                  SabanOS Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                מאמן סוקרטי, משקפת תפעולית חיה ומהנדס פרומפטים אוטונומי עבור ראמי (מנהל תפעול)
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold">Gemini 3.8 Flash • משקפת פעילה</span>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5"
              title="נקה צ'אט"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">איפוס סשן</span>
            </button>

            <a
              href="/"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
              title="חזרה למדריך הראשי"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">חזרה למדריך</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between overflow-hidden">
        
        {/* Quick Prompts Pills Carousel */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              תרחישי הדרכה וחידוד מהירים לראמי:
            </span>
            <span className="text-[11px] text-slate-400">
              לחיצה מזינה ישירות לשאלת המאמן
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_PROMPTS.map((qp) => {
              const IconComp = qp.icon;
              return (
                <button
                  key={qp.id}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={isLoading}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50/80 text-slate-800 hover:text-amber-950 border border-slate-200/90 hover:border-amber-300 text-xs font-medium whitespace-nowrap shadow-2xs transition-all active:scale-98 flex items-center gap-2 shrink-0 group"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors">
                    <IconComp className="w-3.5 h-3.5" />
                  </span>
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Messages Feed */}
        <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 overflow-y-auto min-h-[380px] max-h-[calc(100vh-280px)] flex flex-col gap-5">
          {messages.map((message) => {
            const isUser = message.role === "user";

            if (isUser) {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-slate-900 text-white p-4 shadow-sm text-right">
                    <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-slate-800 pb-1 text-[11px] text-slate-400">
                      <span className="font-bold text-amber-400">ראמי (מנהל תפעול)</span>
                      <span>{message.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            }

            // Coach response: parse and display rich Mirror & Prompt cards
            const parsed = parseCoachResponse(message.content);

            return (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-[95%] sm:max-w-[90%] w-full rounded-2xl rounded-tl-xs bg-gradient-to-b from-white via-slate-50/50 to-white border border-slate-200/90 p-4 sm:p-5 shadow-xs text-right">
                  
                  {/* Coach Message Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 tracking-tight">
                          המאמן הלוגיסטי של סבן
                        </span>
                        <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          AI Coach & Mirror
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      {message.isStreaming && (
                        <span className="flex items-center gap-1 text-amber-600 font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          מנתח ומעצב פקודה...
                        </span>
                      )}
                      <span>{message.timestamp}</span>
                    </div>
                  </div>

                  {/* Intro/Insight Content (Formatted text) */}
                  {parsed.introText ? (
                    <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-3 font-normal">
                      {parsed.introText}
                    </div>
                  ) : message.isStreaming ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>המאמן בונה את התשובה והמשקפת התפעולית...</span>
                    </div>
                  ) : null}

                  {/* Operational Mirror Card */}
                  {parsed.mirror && (
                    <MirrorCard
                      data={parsed.mirror}
                      onUseMasterPrompt={(masterText) => {
                        handleEditPromptInInput(masterText);
                      }}
                    />
                  )}

                  {/* Final Master Prompt Box */}
                  {parsed.prompt && (
                    <PromptCard
                      promptText={parsed.prompt}
                      onEditPrompt={(text) => handleEditPromptInInput(text)}
                    />
                  )}

                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area - Mobile-Optimized for Samsung (44px+ touch targets) */}
        <div className="mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative bg-white rounded-2xl border-2 border-slate-300 focus-within:border-amber-500 focus-within:ring-3 focus-within:ring-amber-500/20 shadow-md p-2 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="כתוב למאמן: סדר יום חדש, הזמנה מורכבת, שאלת שיבוץ, או הנחיה חדשה עבור נועה..."
              className="w-full bg-transparent resize-none outline-hidden text-xs sm:text-sm text-slate-900 placeholder-slate-400 px-3 py-1 font-sans leading-relaxed scrollbar-none"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 px-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="hidden sm:inline">הקש Enter לשליחה • Shift+Enter לשורה חדשה</span>
                <span className="sm:hidden text-amber-700 font-medium">לחיצה על שלח תפיק משקפת וכרטיס פקודה</span>
              </div>

              {/* Large Touch Send Button (min 44px for Samsung Mobile) */}
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className={`min-h-[44px] min-w-[48px] sm:min-w-[100px] px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                  isLoading || !inputPrompt.trim()
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30"
                }`}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 rotate-180" />
                    <span className="hidden sm:inline">שאל את המאמן</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Footer Security & DNA Note */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              מאומן על חוקי סבן (שקי 25 ק"ג, פקדונות 60002 ו-60060, נהגים ספציפיים וסניפי ח. סבן)
            </span>
            <span className="text-slate-400 hidden sm:inline">
              ח. סבן חומרי בניין (1994) בע״מ
            </span>
          </div>
        </div>

      </main>

    </div>
  );
}
