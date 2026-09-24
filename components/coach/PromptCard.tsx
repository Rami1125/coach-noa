"use client";

import React, { useState } from "react";
import { Copy, Check, Edit3, Send, Sparkles, Terminal } from "lucide-react";
import { VoicePlayer } from "./VoicePlayer";

interface PromptCardProps {
  promptText: string;
  title?: string;
  onEditPrompt?: (text: string) => void;
  onSendDirectly?: (text: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  promptText,
  title = "כרטיס פקודה מלוטש להעתקה ישירה (Master Prompt)",
  onEditPrompt,
  onSendDirectly,
}) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        // Fallback for older browsers or constrained frames
        const textArea = document.createElement("textarea");
        textArea.value = promptText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  return (
    <div className="relative my-3 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 shadow-md shadow-amber-500/5 overflow-hidden transition-all text-right">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>הפקודה הועתקה ללוח בהצלחה!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-100/90 via-amber-50/80 to-slate-50 border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Terminal className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight font-['Rubik',sans-serif] flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
                100% DNA סבן
              </span>
            </h4>
          </div>
        </div>

        {/* Action Buttons: Touch-friendly (min 44px on mobile) */}
        <div className="flex items-center gap-1.5">
          <VoicePlayer rawText={promptText} variant="icon" />

          {onEditPrompt && (
            <button
              onClick={() => onEditPrompt(promptText)}
              className="min-h-[38px] sm:min-h-[34px] px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
              title="פתח פקודה לעריכה ידנית בתיבת הקלט"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>ערוך מחדש</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`min-h-[38px] sm:min-h-[34px] px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white ring-2 ring-emerald-400/40"
                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3] text-white" />
                <span>הועתק!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>העתק פקודה</span>
              </>
            )}
          </button>

          {onSendDirectly && (
            <button
              onClick={() => onSendDirectly(promptText)}
              className="min-h-[38px] sm:min-h-[34px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-indigo-500/20"
              title="שגר ישירות לסימולטור של נועה"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span className="hidden sm:inline">בדוק מול נועה</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area - Clean Monospace with Hebrew readability */}
      <div className="p-4 sm:p-5">
        <div className="relative group">
          <div className="bg-slate-900 text-amber-300/90 rounded-xl p-4 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-all border border-slate-800 shadow-inner">
            <span className="text-slate-100 font-sans">{promptText}</span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              מוכן להדבקה בוואטסאפ של הקבלן, בתעודת משלוח, או בשיחה עם נועה
            </span>
            <span className="text-[10px] text-slate-400">
              {promptText.length} תווים
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PromptCard;

