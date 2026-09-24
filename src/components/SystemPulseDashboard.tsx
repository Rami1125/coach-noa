import React from "react";
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Truck, 
  CheckCircle2, 
  Database, 
  ArrowUpRight, 
  Sparkles,
  Lock,
  PackageCheck,
  Scale
} from "lucide-react";
import type { SystemHealthSnapshot } from "@/lib/noa-observer";

interface SystemPulseDashboardProps {
  health: SystemHealthSnapshot;
  onOpenGenerator: () => void;
  onOpenAudit: () => void;
  onOpenSandbox: () => void;
}

export const SystemPulseDashboard: React.FC<SystemPulseDashboardProps> = ({
  health,
  onOpenGenerator,
  onOpenAudit,
  onOpenSandbox,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner: Strict Non-Destructive Policy & Executive Overview */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-['Rubik',sans-serif]">
                דופק המערכת ובקרת מאמן שקט (ראמי - מנהל מערכת)
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              המאמן השקט מאזין בקריאה בלבד לנתוני שטח מ-Firestore (`orders`, `clients`, `logistics_catalog`, `conversations`), מוודא עמידה בחוקי סבן (משקלים, פקדונות 60002/60060, נהגים וסניפים), ומתריע על נקודות עיוורון.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>מדיניות קריאה בלבד (Strict Read-Only)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Overall Health Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ציון בריאות מערכת</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {health.overallHealthScore}
            </span>
            <span className="text-xs font-medium text-slate-500">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${health.overallHealthScore}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            פעיל ומכויל לפי חוקי סבן
          </p>
        </div>

        {/* Logistic Accuracy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">דיוק נועה בתשובות</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {health.accuracyPercentage}%
            </span>
            <span className="text-xs font-medium text-emerald-600">ממוצע שבועי</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${health.accuracyPercentage}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            על סמך {health.totalOrdersInspected} הזמנות ו-{health.recentConversationsInspected} שיחות
          </p>
        </div>

        {/* Deposit Audit Compliance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">תאימות פקדונות (60002/60060)</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Rubik',sans-serif]">
              {health.depositAudit.bigBagRuleMatchRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">בלה 1:1</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex justify-between items-center">
            <span>משטחי 60060 (1:40):</span>
            <span className="font-bold text-slate-900">{health.depositAudit.palletRuleMatchRate}%</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            שווי פקדונות פעילים: ₪{health.depositAudit.totalActiveDepositsValueNis.toLocaleString()}
          </p>
        </div>

        {/* Safety & 25kg Standard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">תקן 25 ק״ג ואיסור סופ״ש</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 font-['Rubik',sans-serif]">
              100% תקני
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex justify-between items-center">
            <span>הפרות מנוף סופ״ש:</span>
            <span className="font-bold text-emerald-600">{health.safetyCompliance.weekendCraneViolations}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            אימות גובה מנוף חכמת: {health.safetyCompliance.highAltitudeClearanceConfirmedRate}%
          </p>
        </div>
      </div>

      {/* Two Column Layout: Detailed Rules Checklist & Blindspots Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Saban Rules Verification Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                בקרת חוקי היסוד של סבן (Observer Audit Checklist)
              </h3>
              <p className="text-xs text-slate-500">
                ניטור רציף מול מאגרי ההזמנות, הקטלוג הלוגיסטי וההנחיות שנלמדו
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
              {health.ruleChecks.length} חוקים מנוטרים
            </span>
          </div>

          <div className="space-y-3">
            {health.ruleChecks.map((check) => (
              <div 
                key={check.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {check.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        check.status === "pass"
                          ? "bg-emerald-100 text-emerald-800"
                          : check.status === "warn"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {check.status === "pass" ? "עובר (100%)" : check.status === "warn" ? "אזהרה" : "נכשל"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {check.description}
                    </p>
                    <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200/50 flex items-start gap-1.5">
                      <span className="font-semibold whitespace-nowrap">המלצת מאמן:</span>
                      <span>{check.recommendation}</span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 font-['Rubik',sans-serif]">
                      {check.score}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Blindspot Alerts & Actions */}
        <div className="space-y-6">
          
          {/* Blind Spots Box */}
          <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm">
                נקודות עיוורון שזוהו בשטח
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              פערים שזוהו על ידי המאמן השקט בין בקשות קבלנים בשטח לתשובות נועה:
            </p>

            <div className="space-y-2.5">
              {health.blindSpotsDetected.map((spot, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                  <span className="leading-snug">{spot}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenAudit}
              className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>צפה בדוח שיפור מטה-פרומפטינג מלא</span>
            </button>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-slate-700">
              קיצורי דרך מהירים למנהל (ראמי)
            </h4>

            <div className="space-y-2">
              <button
                onClick={onOpenGenerator}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-right transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 block">
                    מחולל פקודות חכם להזמנות ואתרים
                  </span>
                  <span className="text-[11px] text-slate-500">
                    הפקת פקודה מדויקת להעתקה לוואטסאפ או לקומקס
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>

              <button
                onClick={onOpenSandbox}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-right transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900 block">
                    הפעלת סימולטור תפקידים חי (Sandbox)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    בדיקת תשובות נועה תוך התחזות לורד, להראל או לקבלן
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Branch & Fleet Mini Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-600" />
              <span>חלוקת עומס בין סניפים ונהגים:</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>סניף 4 החרש (כבד, בלות):</span>
              <span className="font-semibold text-slate-900">{health.branchRoutingAccuracy.branch4HarashShare}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>סניף 1 התלמיד (גבס, צבע):</span>
              <span className="font-semibold text-slate-900">{health.branchRoutingAccuracy.branch1TalmidShare}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: `${health.branchRoutingAccuracy.branch4HarashShare}%` }}></div>
              <div className="bg-cyan-500 h-full" style={{ width: `${health.branchRoutingAccuracy.branch1TalmidShare}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>מרצדס מנוף (חכמת): {health.fleetDispatchMetrics.hikmatCraneAllocationAccuracy}%</span>
              <span>איסוזו חלוקה (עלי): {health.fleetDispatchMetrics.aliLightDistributionAccuracy}%</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
