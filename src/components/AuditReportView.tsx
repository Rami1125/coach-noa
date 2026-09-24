import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  Calendar,
  Layers,
  FileText,
  Sliders,
  Database
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-engine";

interface AuditReportViewProps {
  report: AuditReport;
  onRefreshAudit: () => void;
  isAuditing: boolean;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  report,
  onRefreshAudit,
  isAuditing,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(report.systemPromptOptimization.optimizedPromptInstructions);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-white">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Rubik',sans-serif]">
                דוח ביקורת ואימון AI אוטונומי (Meta-Prompting Report)
              </h2>
              <p className="text-xs text-slate-500">
                הופק באמצעות Gemini 3.8 Flash • נשמר בקולקציית `noa_daily_audits` ב-Firestore
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block">מועד ביקורת:</span>
            <span className="text-xs font-bold text-slate-700">
              {new Date(report.createdAt).toLocaleString("he-IL")}
            </span>
          </div>

          <button
            onClick={onRefreshAudit}
            disabled={isAuditing}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
              isAuditing
                ? "bg-amber-100 text-amber-800 cursor-wait"
                : "bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
            }`}
          >
            {isAuditing ? "מנתח מחדש..." : "הרץ מטה-פרומפט חדש"}
          </button>
        </div>
      </div>

      {/* Main Score & High Level Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Daily Logistic Accuracy */}
        <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            1. ציון דיוק לוגיסטי יומי
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {report.accuracyScore}%
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {report.status === "excellent" ? "מעולה" : "טוב"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            הערכת 10 השיחות האחרונות מול חוקי סבן (משקלים, נהגים, סניפים)
          </p>
        </div>

        {/* Deposit Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            תאימות פקדונות (60002/60060)
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {report.logisticsAuditSummary.depositComplianceRate}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            חיוב 1:1 בלה 60002 ומשטחי עץ לכל 40 שקי מלט
          </p>
        </div>

        {/* Fleet Allocation Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            הקצאת נהגים (חכמת מול עלי)
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {report.logisticsAuditSummary.fleetAllocationScore}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            מרצדס מנוף גובה מול איסוזו חלוקה קלה
          </p>
        </div>

      </div>

      {/* Two Column: 3 Strengths & 3 Areas for Reinforcement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 3 Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              2.1 שלוש נקודות חוזק תפעוליות
            </h3>
          </div>
          <div className="space-y-2.5">
            {report.strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Weaknesses / Areas for Reinforcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              2.2 שלוש נקודות לחיזוק ושיפור מיידי
            </h3>
          </div>
          <div className="space-y-2.5">
            {report.weaknesses.map((weak, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{weak}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Autonomous System Prompt Optimization */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-500" />
              <span>3. המלצת ניסוח משודרגת להנחיית המערכת (System Prompt Optimization)</span>
            </h3>
            <p className="text-xs text-slate-500">
              עדכון אוטונומי ללא מגע יד אדם בקוד • גרסה: {report.systemPromptOptimization.recommendedVersionName}
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all active:scale-95 shrink-0 self-start sm:self-auto"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>הועתק ללוח</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>העתק הנחיה משודרגת</span>
              </>
            )}
          </button>
        </div>

        {/* Rationale and Diff Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">נימוק תפעולי (Rationale):</span>
            <p className="text-slate-600 leading-relaxed">
              {report.systemPromptOptimization.rationale}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">תמצית השינוי (Diff Summary):</span>
            <p className="text-amber-800 font-mono text-[11px] leading-relaxed">
              {report.systemPromptOptimization.diffSummary}
            </p>
          </div>
        </div>

        {/* Code Block */}
        <div className="relative">
          <textarea
            readOnly
            value={report.systemPromptOptimization.optimizedPromptInstructions}
            rows={6}
            className="w-full text-xs font-mono bg-slate-900 text-slate-100 rounded-xl p-4 leading-relaxed resize-none focus:outline-none border border-slate-800 select-all"
          />
        </div>
      </div>

      {/* 4. UI/UX Recommendations (Samsung mobile, Spacing, Contrast) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>4. הצעות לשיפורי עיצוב וממשק (UI/UX Recommendations)</span>
          </h3>
          <p className="text-xs text-slate-500">
            התאמות ייעודיות לנהגים וקבלנים העובדים בשטח עם מכשירי סמסונג באור יום
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Samsung Mobile Fixes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              רספונסיביות בסמסונג (Galaxy / One UI):
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {report.uiUxRecommendations.samsungMobileFixes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contrast & Spacing */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              צבעים וריווחים (קריאות בשמש):
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {report.uiUxRecommendations.contrastAndSpacing.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              כפתורי פעולה מהירה בוואטסאפ:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {report.uiUxRecommendations.quickActionEnhancements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Firestore Audit Record Confirmation Footer */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          <span>
            מזהה רשומת דוח ב-Firestore: <strong className="font-mono text-slate-800">{report.id || "noa-audit-record"}</strong> בקולקציית <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">noa_daily_audits</code>
          </span>
        </div>
        <span className="text-emerald-700 font-bold">✓ נשמר בהצלחה ללא שינוי ברשומות ייצור</span>
      </div>

    </div>
  );
};
