/**
 * PWA Smart Install Prompt Banner
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Supports Samsung Android, Desktop Chrome/Edge, and iOS Safari Add-to-Home-Screen.
 */

import React, { useState, useEffect } from "react";
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2, Sparkles } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";

interface InstallPromptBannerProps {
  className?: string;
}

export const InstallPromptBanner: React.FC<InstallPromptBannerProps> = ({ className = "" }) => {
  const { isInstallable, isInstalled, isIOS, isSamsungDevice, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const wasDismissed = sessionStorage.getItem("saban_pwa_dismissed") === "true";
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("saban_pwa_dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    }
  };

  if (isInstalled || dismissed) {
    return null;
  }

  // Show if installable or if on iOS / mobile device needing guidance
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border-2 border-orange-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-xl backdrop-blur-md ${className}`}
        dir="rtl"
      >
        <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* App Branding & Info */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/20 border border-orange-400/40">
              <Smartphone className="h-6 w-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-wide">
                  התקנת אפליקציית "נועה AI | סבן"
                </span>
                {isSamsungDevice && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-0.5 text-[11px] font-semibold text-orange-300 border border-orange-400/30">
                    <Sparkles className="h-2.5 w-2.5" />
                    סמסונג גלקסי
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                הוסף ישירות למסך הבית לגישה מהירה בחצר, במסופי השטח ובסידור העבודה.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 w-full sm:w-auto">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white px-5 py-3 text-sm sm:text-base font-bold shadow-lg shadow-orange-600/30 transition-all active:scale-95 min-h-[48px] cursor-pointer"
            >
              <Download className="h-5 w-5" />
              <span>{isIOS ? "הוראות התקנה ל-iPhone" : "התקן אפליקציה עכשיו"}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="flex items-center justify-center h-12 w-12 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
              title="סגור באנר"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guided Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">התקנה ב-iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 my-5 text-sm text-slate-700">
              <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-900">לחץ על כפתור השיתוף בספארי</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    בתחתית המסך בספארי, לחץ על סמל השיתוף (<Share2 className="inline h-3.5 w-3.5 mx-1 text-blue-600" />).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-900">בחר "הוסף למסך הבית"</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    גלול מטה בתפריט האפשרויות ובחר בסמל (<PlusSquare className="inline h-3.5 w-3.5 mx-1 text-slate-700" />) "הוסף למסך הבית".
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-900">סיום והפעלה</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    לחץ על "הוסף" (Add) בפינה העליונה. אפליקציית סבן תופיע במסך הבית שלך כאפליקציה מלאה!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              הבנתי, תודה
            </button>
          </div>
        </div>
      )}
    </>
  );
};
