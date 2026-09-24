import React, { useState } from "react";
import { 
  Crown, 
  Database, 
  TrendingUp, 
  Truck, 
  Layers, 
  Compass, 
  Navigation, 
  Receipt, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Bot,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from "lucide-react";
import type { RoleGuideInfo } from "@/src/data/rolesData";

interface RoleGuideCardProps {
  role: RoleGuideInfo;
  onSimulateRole: (role: RoleGuideInfo, samplePrompt?: string) => void;
}

export const RoleGuideCard: React.FC<RoleGuideCardProps> = ({ role, onSimulateRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case "Crown": return <Crown className="w-5 h-5" />;
      case "Database": return <Database className="w-5 h-5" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5" />;
      case "Truck": return <Truck className="w-5 h-5" />;
      case "Layers": return <Layers className="w-5 h-5" />;
      case "Compass": return <Compass className="w-5 h-5" />;
      case "Navigation": return <Navigation className="w-5 h-5" />;
      case "Receipt": return <Receipt className="w-5 h-5" />;
      default: return <Truck className="w-5 h-5" />;
    }
  };

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      
      {/* Role Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs ${role.themeColor.accent}`}>
              {getRoleIcon(role.avatarIcon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 font-['Rubik',sans-serif]">
                  {role.name}
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${role.themeColor.bg} ${role.themeColor.border} ${role.themeColor.text}`}>
                  {role.roleTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {role.department}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSimulateRole(role)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all active:scale-95 shrink-0"
            title="התחל סימולציה ישירה בתפקיד זה"
          >
            <Bot className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">התחזה ל{role.name.split(" ")[0]}</span>
            <span className="sm:hidden">סימולציה</span>
          </button>
        </div>

        {/* Mission statement */}
        <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-800">ייעוד בתפקיד: </span>
          {role.mission}
        </p>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4">
        
        {/* Core Saban Rules for this role */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            חוקי סבן המרכזיים לתפקיד זה:
          </span>
          <div className="space-y-1">
            {role.keySabanRules.slice(0, isExpanded ? undefined : 2).map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Practical Prompts: How to ask Noa */}
        <div className="space-y-3 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            איך לבקש מנועה (ניסוח מדויק):
          </span>

          {role.howToAskGuides.slice(0, isExpanded ? undefined : 1).map((guide, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {guide.intent}
                </span>
                <button
                  onClick={() => handleCopyPrompt(guide.promptTemplate, idx)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-100/60 hover:bg-amber-100 px-2 py-0.5 rounded-lg transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">הועתק</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>העתק פקודה</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-right leading-relaxed select-all">
                "{guide.promptTemplate}"
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-700">מה נועה עונה: </span>
                  {guide.expectedResponse}
                </div>
                <div>
                  <span className="font-semibold text-amber-800">טיפ סבן: </span>
                  {guide.tips}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Card Footer Expand / Collapse Toggle */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>הצג פחות</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>הצג את כל הפקודות והחוקים ({role.howToAskGuides.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <button
          onClick={() => onSimulateRole(role, role.simulationPersona.suggestedQueries[0])}
          className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>תרגל שיחה</span>
        </button>
      </div>

    </div>
  );
};
