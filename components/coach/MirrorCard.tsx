"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeftRight, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

export interface MirrorData {
  ambiguousPrompt: string;
  noaRisk: string;
  masterPrompt: string;
  perfectOutcome: string;
}

interface MirrorCardProps {
  data: MirrorData;
  onUseMasterPrompt?: (text: string) => void;
}

export const MirrorCard: React.FC<MirrorCardProps> = ({
  data,
  onUseMasterPrompt,
}) => {
  // In mobile, user can switch tabs or expand both
  const [mobileTab, setMobileTab] = useState<"both" | "risk" | "master">("both");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="my-4 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-md shadow-slate-200/50 overflow-hidden text-right">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold tracking-tight font-['Rubik',sans-serif]">
                המשקפת התפעולית של נועה (The Operational Mirror)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-semibold border border-indigo-400/20">
                ניתוח בזמן אמת
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              בחינת ההשפעה של דיוק הניסוח על אלגוריתם השיבוץ ומניעת חריגות בשטח
            </p>
          </div>
        </div>

        {/* Toggle Expand */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title={isExpanded ? "כווץ משקפת" : "הרחב משקפת"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-5">
          
          {/* Mobile Tab Switcher (Visible on small screens) */}
          <div className="flex sm:hidden items-center gap-1 p-1 bg-slate-100 rounded-xl mb-3 text-xs">
            <button
              onClick={() => setMobileTab("both")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                mobileTab === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              השוואה מלאה
            </button>
            <button
              onClick={() => setMobileTab("risk")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                mobileTab === "risk" ? "bg-rose-50 text-rose-700 shadow-xs" : "text-slate-500"
              }`}
            >
              מה שעלול לקרות ⚠️
            </button>
            <button
              onClick={() => setMobileTab("master")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                mobileTab === "master" ? "bg-emerald-50 text-emerald-700 shadow-xs" : "text-slate-500"
              }`}
            >
              הפתרון המדויק ✨
            </button>
          </div>

          {/* Grid Layout: Desktop Side-by-Side, Mobile Stacked or Selected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Card: The Ambiguous / High Risk Scenario */}
            {(mobileTab === "both" || mobileTab === "risk") && (
              <div className="rounded-xl border border-rose-200/80 bg-gradient-to-b from-rose-50/60 to-white p-4 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      אם תנסח כך (ניסוח שטח חלקי / עמום):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                      סכנת חריגה
                    </span>
                  </div>

                  <div className="p-3 bg-white/80 rounded-lg border border-rose-100 text-xs font-mono text-slate-800 leading-relaxed mb-3">
                    "{data.ambiguousPrompt}"
                  </div>

                  <div className="rounded-lg bg-rose-100/50 border border-rose-200 p-3 text-xs text-rose-900">
                    <div className="flex items-start gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>איך נועה עלולה לטעות או להפר חוק סבן:</span>
                    </div>
                    <p className="pr-5 text-rose-800 text-[11px] sm:text-xs leading-relaxed">
                      {data.noaRisk}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-rose-100 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <span>תוצאה משוערת:</span>
                  <span className="font-semibold underline">עיכוב באספקה, תלונת נהג, או אי-חיוב פקדונות.</span>
                </div>
              </div>
            )}

            {/* Right Card: The Master / 100% Precise Scenario */}
            {(mobileTab === "both" || mobileTab === "master") && (
              <div className="rounded-xl border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/70 to-white p-4 flex flex-col justify-between shadow-2xs ring-1 ring-emerald-500/10">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      אם תנסח מדויק לפי ה-DNA של סבן:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      דיוק 100%
                    </span>
                  </div>

                  <div className="p-3 bg-white/90 rounded-lg border border-emerald-200 text-xs font-mono text-slate-900 leading-relaxed mb-3 font-medium">
                    "{data.masterPrompt}"
                  </div>

                  <div className="rounded-lg bg-emerald-100/60 border border-emerald-200 p-3 text-xs text-emerald-950">
                    <div className="flex items-start gap-1.5 font-bold mb-1 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>התוצאה של נועה: כרטיס סידור מנורמל</span>
                    </div>
                    <p className="pr-5 text-emerald-900 text-[11px] sm:text-xs leading-relaxed">
                      {data.perfectOutcome}
                    </p>
                  </div>
                </div>

                {onUseMasterPrompt && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                    <button
                      onClick={() => onUseMasterPrompt(data.masterPrompt)}
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>השתמש בנוסח המאסטר המנצח</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Subtext info */}
          <div className="mt-3 px-1 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3 text-indigo-600" />
              המשקפת מונעת שיבוץ נהגים שגויים, חוסר במשקלי מלט, ואיבוד פיקדונות בלה/משטחים
            </span>
            <span className="font-semibold text-indigo-700 hidden sm:inline">
              Saban Operational Assurance
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

export default MirrorCard;

