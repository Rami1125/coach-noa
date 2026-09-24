import React from "react";
import { 
  Building2, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  BookOpen, 
  SlidersHorizontal,
  Bot
} from "lucide-react";

interface HeaderProps {
  healthScore: number;
  accuracyPercentage: number;
  onTriggerAudit: () => void;
  isAuditing: boolean;
  activeMainTab: "dashboard" | "roles" | "generator" | "sandbox" | "audit" | "coach";
  setActiveMainTab: (tab: "dashboard" | "roles" | "generator" | "sandbox" | "audit" | "coach") => void;
  onNavigateToCoach?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  healthScore,
  accuracyPercentage,
  onTriggerAudit,
  isAuditing,
  activeMainTab,
  setActiveMainTab,
  onNavigateToCoach,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight font-['Rubik',sans-serif]">
                  נועה AI
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200/60">
                  Coach & Guide
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  מאזין שקט פעיל
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ח. סבן חומרי בניין (1994) בע״מ • סניף 4 החרש | סניף 1 התלמיד
              </p>
            </div>
          </div>

          {/* Health Badge & Audit Trigger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Score Pill */}
            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-600">דיוק נועה:</span>
                <span className="font-bold text-slate-900">{accuracyPercentage}%</span>
              </div>
              <div className="w-px h-3.5 bg-slate-300"></div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                <span className="text-slate-600">דופק מערכת:</span>
                <span className="font-bold text-slate-900">{healthScore}/100</span>
              </div>
            </div>

            {/* Run Autonomous Audit Button */}
            <button
              onClick={onTriggerAudit}
              disabled={isAuditing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isAuditing
                  ? "bg-amber-100 text-amber-800 cursor-wait border border-amber-300"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] shadow-amber-500/25"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? "מבצע מטה-פרומפטינג..." : "הרץ ביקורת AI יומית"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 border-t border-slate-100 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => {
              if (onNavigateToCoach) {
                onNavigateToCoach();
              } else {
                setActiveMainTab("coach");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs ${
              activeMainTab === "coach"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20"
                : "bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/80"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>חדר המאמן והמשקפת (Studio)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/70 text-indigo-950 font-black">
              חדש
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeMainTab === "dashboard"
                ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>דופק מנהל (ראמי)</span>
          </button>

          <button
            onClick={() => setActiveMainTab("roles")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeMainTab === "roles"
                ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>מדריך לכל אנשי התפקידים (8)</span>
          </button>

          <button
            onClick={() => setActiveMainTab("generator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeMainTab === "generator"
                ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>מחולל פקודות חכם</span>
          </button>

          <button
            onClick={() => setActiveMainTab("sandbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeMainTab === "sandbox"
                ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>סימולציה ובדיקה חיה (Interactive Sandbox)</span>
          </button>

          <button
            onClick={() => setActiveMainTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
              activeMainTab === "audit"
                ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>דוח אימון ומטה-פרומפט</span>
          </button>
        </div>
      </div>
    </header>
  );
};
