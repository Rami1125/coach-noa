/**
 * Logistics & Catalog Studio (סטודיו מילון לוגיסטי ומוצרים)
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Catalog, Slang dictionary, Deposits (60002/60060), and Fleet Truck Mapping.
 */

import React, { useState } from "react";
import {
  Package,
  Search,
  Truck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Coins,
  CheckCircle2,
  Building2,
  Sparkles,
  Layers,
  Filter
} from "lucide-react";
import { DeviceProfileSwitcher } from "../../components/theme/DeviceProfileSwitcher";
import { useDeviceTheme } from "../../lib/device-theme-context";

interface CatalogItem {
  sku: string;
  name: string;
  category: "cement" | "aggregates" | "blocks" | "gypsum_finishing" | "deposits";
  slangTerms: string[];
  depositSku?: string;
  depositName?: string;
  preferredBranch: "סניף 4 החרש" | "סניף 1 התלמיד";
  assignedTruck: "חכמת (מרצדס מנוף)" | "עלי (איסוזו משטחים)" | "אמיר (משאית קלה)" | "מוראד (מנוף בינוני)";
  notes: string;
}

const SAMPLE_CATALOG: CatalogItem[] = [
  {
    sku: "10101",
    name: "מלט פורטלנד אפור 25 ק״ג (נשר)",
    category: "cement",
    slangTerms: ["מלט אפור", "שק מלט", "שק נשר"],
    depositSku: "60060",
    depositName: "פיקדון משטח עץ (1 לכל 40 שקים)",
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "עלי (איסוזו משטחים)",
    notes: "תקן בטיחות מחמיר: 25 ק״ג בלבד! חל איסור מוחלט על שיווק שקי 50 ק״ג.",
  },
  {
    sku: "10204",
    name: "טיט מוכן לבנייה (שק בלה)",
    category: "aggregates",
    slangTerms: ["באלה טיט", "בלה טיט שחור", "טיט מוכן"],
    depositSku: "60002",
    depositName: "פיקדון שק בלה (1:1)",
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "חכמת (מרצדס מנוף)",
    notes: "מחייב שורת פיקדון בלה 60002 במחיר 35 ש״ח. מונף במנוף לקומות או פריקת חצר.",
  },
  {
    sku: "10201",
    name: "חול ים שטוף בתפזורת (שק בלה 0.6 קוב)",
    category: "aggregates",
    slangTerms: ["בלה חול", "חול לריצוף", "חול לבנייה"],
    depositSku: "60002",
    depositName: "פיקדון שק בלה (1:1)",
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "חכמת (מרצדס מנוף)",
    notes: "חומרי תשתית כבדים - אספקה בלעדית מסניף 4 החרש ראשון לציון.",
  },
  {
    sku: "10202",
    name: "סומסום לריצוף שטוף (שק בלה)",
    category: "aggregates",
    slangTerms: ["בלה סומסום", "מצע לריצוף", "שומשום"],
    depositSku: "60002",
    depositName: "פיקדון שק בלה (1:1)",
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "חכמת (מרצדס מנוף)",
    notes: "חיוב פקדון 60002 אוטומטי ביחס 1:1. זיכוי בהחזרת הבלה שלמה לחצר.",
  },
  {
    sku: "20105",
    name: "בלוק איטונג 20 (משטח 60 יח׳)",
    category: "blocks",
    slangTerms: ["איטונג 20", "משטח איטונג", "בלוק קל"],
    depositSku: "60060",
    depositName: "פיקדון משטח עץ (1:1 למשטח)",
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "חכמת (מרצדס מנוף)",
    notes: "כיסוי לקיר: 8.33 בלוקים למ״ר. פריקת גובה לקומה 2+ מחייבת את חכמת.",
  },
  {
    sku: "30110",
    name: "לוח גבס לבן סטנדרטי 12.5 מ״מ (אורבונד)",
    category: "gypsum_finishing",
    slangTerms: ["לוח גבס רגיל", "גבס לבן", "פלטות גבס"],
    preferredBranch: "סניף 1 התלמיד",
    assignedTruck: "עלי (איסוזו משטחים)",
    notes: "חומרי גמר ושיפוץ פנים - אספקה מהירה מסניף 1 התלמיד בתל אביב.",
  },
  {
    sku: "30220",
    name: "דבק קרמיקה שרמיק 114 (שק 25 ק״ג)",
    category: "gypsum_finishing",
    slangTerms: ["דבק קרמיקה", "שרמיק", "דבק שקיות"],
    depositSku: "60060",
    depositName: "פיקדון משטח עץ (בחלוקת משטחים)",
    preferredBranch: "סניף 1 התלמיד",
    assignedTruck: "אמיר (משאית קלה)",
    notes: "מתאים לחלוקות מהירות במרכזי ערים וסמטאות צרות בתל אביב.",
  },
  {
    sku: "60002",
    name: "פיקדון שק בלה (זיכוי בהחזרה)",
    category: "deposits",
    slangTerms: ["פקדון בלה", "זיכוי באלה", "60002"],
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "עלי (איסוזו משטחים)",
    notes: "עלות 35 ש״ח. חובת הוספה 1:1 לכל שק בלה של חול/טיט/סומסום/חצץ.",
  },
  {
    sku: "60060",
    name: "פיקדון משטח עץ תקני (זיכוי בהחזרה)",
    category: "deposits",
    slangTerms: ["פקדון משטח", "משטח עץ", "60060"],
    preferredBranch: "סניף 4 החרש",
    assignedTruck: "עלי (איסוזו משטחים)",
    notes: "עלות 60 ש״ח. חובת הוספה לכל 40 שקי מלט או לכל משטח בלוקים/דבקים.",
  },
];

interface CatalogStudioPageProps {
  onNavigate?: (path: string) => void;
}

export default function CatalogStudioPage({ onNavigate }: CatalogStudioPageProps) {
  const { isMobile } = useDeviceTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredItems = SAMPLE_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.includes(searchTerm) ||
      item.slangTerms.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo("/portal")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="חזרה למסוף השער"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">
                סטודיו מילון לוגיסטי ומוצרים
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ח. סבן חומרי בניין (1994) בע״מ | קטלוג מק״טים, פקדונות וסלנג שטח
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://docs.google.com/spreadsheets/d/1Ie7gKql_EDdrIN9HqunJc9Ey5k0WXXfPRxs0Vp1Bs2c"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
            >
              <span>גיליון מערכת מאוחדת</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <DeviceProfileSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="חפש לפי שם מוצר, מק״ט Comax, או סלנג קבלנים (למשל: באלה טיט, איטונג, נשר, 60002)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none text-sm font-medium transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                הכל (1,240)
              </button>
              <button
                onClick={() => setSelectedCategory("cement")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === "cement"
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100"
                }`}
              >
                מלט 25 ק״ג
              </button>
              <button
                onClick={() => setSelectedCategory("aggregates")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === "aggregates"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                תפזורת ובלות
              </button>
              <button
                onClick={() => setSelectedCategory("deposits")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === "deposits"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                }`}
              >
                פקדונות (60002/60060)
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.sku}
              className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xs hover:border-orange-500 hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    מק״ט: {item.sku}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{item.name}</h3>
                </div>
              </div>

              {/* Slang terms */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  סלנג קבלנים מזוהה:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.slangTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      "{term}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Deposit binding */}
              {item.depositSku && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                  <Coins className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>פקדון חובה:</strong> מק״ט {item.depositSku} ({item.depositName})
                  </span>
                </div>
              )}

              {/* Logistics & Fleet */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  {item.preferredBranch}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                  {item.assignedTruck}
                </span>
              </div>

              {/* Notes */}
              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                {item.notes}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
