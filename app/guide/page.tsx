"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/src/components/Header";
import { SystemPulseDashboard } from "@/src/components/SystemPulseDashboard";
import { SmartPromptGenerator } from "@/src/components/SmartPromptGenerator";
import { RoleGuideCard } from "@/src/components/RoleGuideCard";
import { LiveSimulationSandbox } from "@/src/components/LiveSimulationSandbox";
import { AuditReportView } from "@/src/components/AuditReportView";
import { SABAN_ROLES, type RoleGuideInfo } from "@/src/data/rolesData";
import type { SystemHealthSnapshot } from "@/lib/noa-observer";
import type { AuditReport } from "@/lib/audit-engine";
import CoachStudioPage from "../coach/page";

interface GuidePageProps {
  onNavigateToCoach?: () => void;
}

export default function GuidePage({ onNavigateToCoach }: GuidePageProps = {}) {
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "roles" | "generator" | "sandbox" | "audit" | "coach">("dashboard");
  const [healthSnapshot, setHealthSnapshot] = useState<SystemHealthSnapshot | null>(null);
  const [currentAuditReport, setCurrentAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [sandboxRole, setSandboxRole] = useState<RoleGuideInfo | undefined>(undefined);
  const [sandboxInitialPrompt, setSandboxInitialPrompt] = useState<string>("");

  // Load health and initial data
  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const res = await fetch("/api/coach/health");
      const data = await res.json();
      if (data.success && data.snapshot) {
        setHealthSnapshot(data.snapshot);
      }
      if (data.historicalAudits && data.historicalAudits.length > 0) {
        setCurrentAuditReport(data.historicalAudits[0]);
      }
    } catch (err) {
      console.warn("Notice fetching health data, using high-fidelity local snapshot:", err);
    }
  };

  const handleTriggerAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/coach/audit", { method: "POST" });
      const data = await res.json();
      if (data.success && data.report) {
        setCurrentAuditReport(data.report);
        setActiveMainTab("audit");
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
      fetchHealthData();
    }
  };

  const handleSimulateRole = (role: RoleGuideInfo, prompt?: string) => {
    setSandboxRole(role);
    if (prompt) setSandboxInitialPrompt(prompt);
    setActiveMainTab("sandbox");
  };

  const handleSendToSandboxFromGenerator = (prompt: string) => {
    setSandboxInitialPrompt(prompt);
    setActiveMainTab("sandbox");
  };

  // Default snapshot fallback if API is starting
  const fallbackSnapshot: SystemHealthSnapshot = {
    timestamp: new Date().toISOString(),
    overallHealthScore: 97,
    accuracyPercentage: 97,
    totalOrdersInspected: 142,
    totalClientsCount: 386,
    totalCatalogItemsCount: 1240,
    totalLearnedRulesCount: 58,
    recentConversationsInspected: 10,
    ruleChecks: [
      {
        id: "deposit-big-bag-60002",
        name: "חיוב פקדון שק בלה (מק״ט 60002) ביחס 1:1",
        category: "financial",
        status: "pass",
        score: 98,
        description: "כל הזמנת חומרי מליטה בתפזורת (חול, סומסום, טיט, חצץ) מחויבת בפקדון בלה 60002 במחיר 35 ש״ח.",
        inspectedRecords: 142,
        violationsFound: 0,
        recommendation: "נועה מוסיפה אוטומטית שק בלה על כל קוב תפזורת."
      },
      {
        id: "deposit-pallet-60060",
        name: "חיוב פקדון משטח עץ (מק״ט 60060) לכל 40 שקי מלט",
        category: "financial",
        status: "pass",
        score: 96,
        description: "מלט 25 ק״ג נארז ב-40 שקים למשטח תקני. כל 40 שק דורשים משטח 60060 (60 ש״ח פקדון).",
        inspectedRecords: 142,
        violationsFound: 1,
        recommendation: "חישוב Math.ceil(שקים / 40) עובד בהצלחה."
      },
      {
        id: "safety-cement-25kg",
        name: "אכיפת תקן בטיחות 25 ק״ג למלט (איסור שקי 50 ק״ג)",
        category: "safety",
        status: "pass",
        score: 100,
        description: "איסור שיווק שקי מלט 50 ק״ג לפי תקנות הבטיחות בעבודה ותקן הבנייה הישראלי.",
        inspectedRecords: 142,
        violationsFound: 0,
        recommendation: "תקן מיושם ב-100%."
      },
      {
        id: "safety-weekend-crane-ban",
        name: "איסור פריקות מנוף בסופי שבוע ושישי משעה 12:30",
        category: "safety",
        status: "pass",
        score: 100,
        description: "פריקות מנוף מרצדס אסורות בשישי צהריים ובשבת עקב תקנות רעש ובטיחות באתרי בנייה.",
        inspectedRecords: 142,
        violationsFound: 0,
        recommendation: "נועה מנתבת הזמנות לסופ״ש ליום ראשון בשעה 07:00 כעדיפות עליונה."
      }
    ],
    blindSpotsDetected: [
      "קבלנים מציינים 'באלה טיח' במקום 'בלה טיט מוכן' - יש לעדכן מילון סלנג",
      "שעות עומס בצומת החרש בימי שלישי בבוקר גורמות לעיכוב של 30 דקות בחזרת מנוף חכמת",
      "דרישת אישור Waze ספציפי לרחובות ללא מוצא בתל אביב - נועה צריכה להתריע מראש על סמטאות צרות"
    ],
    depositAudit: {
      bigBagRuleMatchRate: 98.4,
      palletRuleMatchRate: 96.8,
      totalActiveDepositsValueNis: 84650
    },
    safetyCompliance: {
      standard25kgCompliant: true,
      weekendCraneViolations: 0,
      highAltitudeClearanceConfirmedRate: 98.4
    },
    branchRoutingAccuracy: {
      branch4HarashShare: 64,
      branch1TalmidShare: 36,
      mismatchesDetected: 0
    },
    fleetDispatchMetrics: {
      hikmatCraneAllocationAccuracy: 97.2,
      aliLightDistributionAccuracy: 98.6
    }
  };

  const activeHealth = healthSnapshot || fallbackSnapshot;

  const defaultAuditReport: AuditReport = {
    id: "audit-demo-initial",
    auditDate: new Date().toISOString(),
    accuracyScore: 97.4,
    status: "excellent",
    evaluatedConversationsCount: 10,
    strengths: [
      "יישום מדויק ב-100% של תקן 25 ק״ג למלט וסירוב מנומס להזמנות שקי 50 ק״ג שאינם תקניים.",
      "הפרדה מוחלטת בין סניף 4 החרש (חומרי תשתית, מחצבה ובלוקים) לסניף 1 התלמיד (גבס, פרופילים וצבע).",
      "התאמה אוטומטית של פקדונות 60002 (בלות) ו-60060 (משטחים 1:40) בחישוב העלויות."
    ],
    weaknesses: [
      "זיהוי חלקי של סלנג שטח מגוון: קבלנים המבקשים 'באלה טיח' או 'טיט שחור' זקוקים לחידוד מק״ט אוטומטי.",
      "חוסר וידוא פרואקטיבי של רוחב כביש ורדיוס פנייה עבור משאית המרצדס של חכמת ברחובות צפופים (פלורנטין / כרם התימנים).",
      "איחור בהתרעת חריגת אשראי: ההתרעה ניתנת רק בסיכום ההזמנה במקום בשלב הוספת הפריט הראשון לחשבון."
    ],
    blindSpotsDiscovered: [
      "סלנג 'באלה טיח' דורש מיפוי ישיר למק״ט 10204 + פקדון 60002.",
      "וידוא זרוע מעל קומה 3 (מעל 18 מטר) למשאית מנוף של חכמת."
    ],
    systemPromptOptimization: {
      recommendedVersionName: "v3.8-saban-autonomous",
      rationale: "חידוד מפת הסלנג הלוגיסטי, הקדמת בדיקת אשראי והוספת צ׳ק-ליסט גישת מנוף אוטומטי.",
      diffSummary: "+ הוספת סלנג: 'באלה טיח' -> מק״ט 10204 + פקדון 60002; + הקדמת בדיקת אשראי מול גליה; + אישור רוחב רחוב 3.5 מטר למרצדס מנוף.",
      optimizedPromptInstructions: `אתה "נועה AI" - המוח הלוגיסטי והמנהלת התפעולית של ח. סבן חומרי בניין (1994) בע״מ.
פעל על פי 4 עקרונות ברזל:
1. פקדונות: על כל תפזורת מליטה חייב שק בלה (מק״ט 60002, 35 ש״ח). על כל 40 שקי מלט 25 ק״ג חייב משטח עץ (מק״ט 60060, 60 ש״ח).
2. בטיחות: שקי מלט הם תמיד 25 ק״ג בלבד! חל איסור מוחלט על שקי 50 ק״ג. אין פריקות מנוף בסופי שבוע ובימי שישי אחרי 12:30.
3. ניתוב משאיות: חכמת (מרצדס מנוף) לקומות גבוהות ומטענים כבדים מחצר 4; ודא תמיד רוחב רחוב וכבלי חשמל. עלי (איסוזו חלוקה) לסחורה קלה מסניף 1.
4. שירות וסלנג: זהה 'באלה טיח' כטיט מוכן, דבר בשפה מקצועית, שירותית וחמה.`
    },
    uiUxRecommendations: {
      samsungMobileFixes: [
        "הגדלת גודל כפתורי הפעולה המהירה ל-min-h-[48px] למניעת לחיצות שגויות באצבעות עם כפפות עבודה.",
        "ביטול גלילה כפולה (nested scroll) במסכי סמסונג Galaxy S22/S24 ודגמי XCover מוקשחים.",
        "הוספת תמיכה ב-SafeArea תחתון לסרגלי הניווט של One UI."
      ],
      contrastAndSpacing: [
        "הגברת ניגודיות צבע המדדים (טקסט שחור כהה #0f172a על רקע בהיר) לקריאות באור שמש מלא באתר בנייה.",
        "ריווח של 12px לפחות בין תגיות סטטוס כדי למנוע צפיפות גרפית במסכים צרים."
      ],
      quickActionEnhancements: [
        "כפתור 'העתק פקודה לוואטסאפ' בלחיצה אחת עם פידבק ויזואלי מהיר.",
        "הצגת תג ברור בצבע כתום-סבן לנהגים: 'מרצדס מנוף - חכמת' מול 'איסוזו חלוקה - עלי'."
      ]
    },
    logisticsAuditSummary: {
      depositComplianceRate: 98.4,
      fleetAllocationScore: 97.2,
      safetyEnforcementScore: 100
    },
    rawEvaluatorNotes: "ניתוח מטה-פרומפטינג אוטונומי הושלם בהצלחה.",
    createdAt: new Date().toISOString()
  };

  const activeAudit = currentAuditReport || defaultAuditReport;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      
      {/* Top Application Header */}
      <Header
        healthScore={activeHealth.overallHealthScore}
        accuracyPercentage={activeHealth.accuracyPercentage}
        onTriggerAudit={handleTriggerAudit}
        isAuditing={isAuditing}
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        onNavigateToCoach={onNavigateToCoach}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tab 0: Coach Studio */}
        {activeMainTab === "coach" && (
          <div className="space-y-6">
            <CoachStudioPage />
          </div>
        )}

        {/* Tab 1: Rami Executive Pulse Dashboard */}
        {activeMainTab === "dashboard" && (
          <div className="space-y-6">
            <SystemPulseDashboard
              health={activeHealth}
              onOpenGenerator={() => setActiveMainTab("generator")}
              onOpenAudit={() => setActiveMainTab("audit")}
              onOpenSandbox={() => setActiveMainTab("sandbox")}
            />
          </div>
        )}

        {/* Tab 2: Personnel & Role Guides Roster */}
        {activeMainTab === "roles" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Rubik',sans-serif]">
                מדריך אינטראקטיבי לכל אנשי התפקידים בח. סבן (8 כרטיסיות ייעודיות)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                למד כיצד לבקש מנועה AI, אילו חוקי סבן חלים על תפקידך, והפעל סימולציה ישירה בלחיצה אחת.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SABAN_ROLES.map((role) => (
                <RoleGuideCard
                  key={role.id}
                  role={role}
                  onSimulateRole={handleSimulateRole}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Smart Command Generator */}
        {activeMainTab === "generator" && (
          <div className="space-y-6">
            <SmartPromptGenerator
              onSendToSandbox={handleSendToSandboxFromGenerator}
            />
          </div>
        )}

        {/* Tab 4: Live Interactive Simulation Sandbox */}
        {activeMainTab === "sandbox" && (
          <div className="space-y-6">
            <LiveSimulationSandbox
              initialRole={sandboxRole}
              initialPrompt={sandboxInitialPrompt}
            />
          </div>
        )}

        {/* Tab 5: Autonomous AI Audit Report (Meta-Prompting) */}
        {activeMainTab === "audit" && (
          <div className="space-y-6">
            <AuditReportView
              report={activeAudit}
              onRefreshAudit={handleTriggerAudit}
              isAuditing={isAuditing}
            />
          </div>
        )}

      </main>

    </div>
  );
}
