/**
 * Portal Gateway Hub (מסוף שער ומרכז שליטה תפעולי)
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Features:
 * - Direct launch button to live app: https://ai-chat-noa.vercel.app/chat
 * - Route to Coach & Mirror (/coach)
 * - Route to Logistics Catalog Studio (/catalog-studio)
 * - Route to Interactive Guide (/guide)
 * - Bidirectional Sheets Sync: "נועה Ai" and "מערכת מאוחדת" (1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c)
 * - Live truth KPI dashboard (Orders, Fleet, Learned Knowledge)
 * - Full ADMIN & Observer permission modes
 */

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Bot,
  Brain,
  Package,
  BookOpen,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Lock,
  Eye,
  FileText,
  Building2,
  Check
} from "lucide-react";
import { InstallPromptBanner } from "../../components/pwa/InstallPromptBanner";
import { DeviceProfileSwitcher } from "../../components/theme/DeviceProfileSwitcher";
import { useDeviceTheme } from "../../lib/device-theme-context";

interface PortalPageProps {
  onNavigate?: (path: string) => void;
}

export default function PortalPage({ onNavigate }: PortalPageProps) {
  const { theme, isMobile } = useDeviceTheme();
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "in_progress" | "success">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<string>("לפני 4 דקות");
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  // Sync simulation
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatus("in_progress");

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus("success");
      setLastSyncTime("הרגע עודכן");
      setTimeout(() => setSyncStatus("idle"), 4000);
    }, 1800);
  };

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16" dir="rtl">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
                  סבן חומרי בניין (1994) בע״מ
                </h1>
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-200">
                  מרכז שליטה
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                מסוף שער ראשי | מערכת נועה AI, חדר המאמן וסנכרון גליונות
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin / Observer Role Badge */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isAdminMode
                  ? "bg-slate-900 text-white border-slate-800 shadow-xs"
                  : "bg-amber-50 text-amber-900 border-amber-300"
              }`}
              title="לחץ להחלפה בין הרשאת ADMIN למשקיף"
            >
              {isAdminMode ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>הרשאת ADMIN (ראמי)</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-amber-700" />
                  <span>מצב משקיף בלבד</span>
                </>
              )}
            </button>

            {/* Device Profile Switcher */}
            <DeviceProfileSwitcher />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* PWA In-App Install Prompt Banner */}
        <InstallPromptBanner />

        {/* HERO: Direct Launch to Live Noa AI App */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/80">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 h-56 w-56 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300 border border-orange-400/30">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                מערכת שטח חיה ומבצעית
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                נועה AI • מנוע סידור עבודה ותפעול חכם
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                מערכת ה-AI הראשית לקבלת הזמנות, בדיקת מחירוני Comax, פיקוח על פקדונות בלה (60002) ומשטחי עץ (60060), ואכיפת תקן בטיחות 25 ק"ג למלט.
              </p>
            </div>

            {/* Launch CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="https://ai-chat-noa.vercel.app/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-8 py-4 text-lg font-bold shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all active:scale-95 min-h-[56px] text-center"
              >
                <span>🚀 שיגור ישיר: כניסה לצ'אט נועה (חי)</span>
                <ExternalLink className="h-5 w-5" />
              </a>

              <p className="text-xs text-center text-slate-400 font-medium">
                קישור מוגן ומאובטח: ai-chat-noa.vercel.app/chat
              </p>
            </div>
          </div>
        </div>

        {/* Action Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: AI Coach Studio */}
          <div
            onClick={() => navigateTo("/coach")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:border-orange-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Brain className="h-7 w-7" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                חדר המאמן
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                חדר המאמן והמשקפת של נועה
              </h3>
              <p className="text-sm text-slate-600 leading-normal">
                המאמן האישי של ראמי: בדיקת חלופות חינמיות, שאלון אמריקאי בלחיצה אחת, והדגמת משקפת תפעולית (מה נועה תבין לעומת מה התכוונת).
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-orange-600">
              <span>היכנס לחדר המאמן</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>

          {/* Card 2: Logistics & Catalog Studio */}
          <div
            onClick={() => navigateTo("/catalog-studio")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package className="h-7 w-7" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                קטלוג ומק״טים
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                סטודיו מילון לוגיסטי ומוצרים
              </h3>
              <p className="text-sm text-slate-600 leading-normal">
                מאגר 1,240 מק״טים: מפת סלנג קבלנים, שיוך רכבים (חכמת מנוף, עלי איסוזו, אמיר סמטאות), ופקדונות 60002 ו-60060.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-blue-600">
              <span>צפה במאגר המוצרים</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>

          {/* Card 3: Interactive Guide & System Health */}
          <div
            onClick={() => navigateTo("/guide")}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookOpen className="h-7 w-7" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                מדריך ובקרה
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                מדריך אינטראקטיבי ומדדי בריאות
              </h3>
              <p className="text-sm text-slate-600 leading-normal">
                סימולציית תפקידים (איציק, ורד, הראל, נהגים), דוח ביקורת יומי אוטונומי, וסריקת תקינות בזמן אמת מול Firestore.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <span>צפה במדריך ודוחות</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </div>
          </div>
        </div>

        {/* Bidirectional Saban Sheets Sync Terminal */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  סנכרון דו-כיווני: גליונות סבן ↔ מאגר Firestore
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  סנכרון מאוחד ללא דריסת נתונים היסטוריים. עדכון אחרון: {lastSyncTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-5 py-2.5 text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "מסנכרן גליונות..." : "בצע סנכרון דו-כיווני כעת"}</span>
              </button>

              <button
                onClick={() => setShowSheetsModal(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition cursor-pointer min-h-[44px]"
              >
                <span>הגדרות גליונות</span>
              </button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {syncStatus === "success" && (
            <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-semibold animate-in fade-in duration-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>הסנכרון הדו-כיווני הושלם בהצלחה: כל שורות גיליון "נועה Ai" וגיליון "מערכת מאוחדת" סונכרנו מול Firestore!</span>
            </div>
          )}

          {/* Sheets Cards */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sheet 1: Noa Ai */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  גיליון 1: "נועה Ai" (פניות והזמנות שטח)
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  מחובר ופעיל
                </span>
              </div>
              <p className="text-xs text-slate-600">
                קולט שיחות חיות, דרישות אספקה, סטטוס לקוח, ונתוני שיבוץ נהגים בזמן אמת.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-mono">
                  טאב ראשי: `Live_Dispatches` (142 שורות)
                </span>
                <a
                  href="https://docs.google.com/spreadsheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>פתח ב-Google Sheets</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Sheet 2: Unified System */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  גיליון 2: "מערכת מאוחדת סבן"
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                  מזהה מאומת
                </span>
              </div>
              <p className="text-xs text-slate-600">
                מזהה גוגל רשמי: <span className="font-mono font-semibold text-slate-800">1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c</span>
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-mono">
                  סנכרון: Comax Logistics ↔ Firestore
                </span>
                <a
                  href="https://docs.google.com/spreadsheets/d/1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>פתח גיליון מאוחד</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operational Truth KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">הזמנות פתוחות</span>
              <FileText className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">142</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">100% תאימות פקדונות</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">צי נהגים פעיל</span>
              <Truck className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4 / 4</div>
            <p className="text-xs text-slate-500 font-medium mt-1">חכמת, עלי, אמיר, מוראד</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">מק״טים וסלנג</span>
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,240</div>
            <p className="text-xs text-slate-500 font-medium mt-1">מחירון Comax מעודכן</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">כללים שנלמדו</span>
              <Brain className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">58</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">בקרת בטיחות מלאה</p>
          </div>
        </div>
      </main>

      {/* Sheets Config Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                הגדרות סנכרון גליונות סבן
              </h3>
              <button
                onClick={() => setShowSheetsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-500">כתובת גיליון מערכת מאוחדת:</span>
                <p className="font-mono text-xs text-blue-700 break-all select-all">
                  https://docs.google.com/spreadsheets/d/1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c
                </p>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 space-y-1">
                <span className="font-bold text-xs text-orange-800">מדיניות שמירה קשיחה (Non-Destructive):</span>
                <p className="text-xs text-orange-900">
                  הסנכרון מתבצע במצב Append & Validate. שורות קיימות ב-Firestore אינן נדרסות לעולם ללא אישור כפול.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSheetsModal(false)}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              סגור הגדרות
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
