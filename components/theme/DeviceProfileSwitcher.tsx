/**
 * Device Profile & Sunlight Contrast Switcher Component
 * ח. סבן חומרי בניין (1994) בע״מ
 */

import React from "react";
import { Smartphone, Monitor, Sun } from "lucide-react";
import { useDeviceTheme } from "../../lib/device-theme-context";

interface DeviceProfileSwitcherProps {
  className?: string;
  showSunlightToggle?: boolean;
}

export const DeviceProfileSwitcher: React.FC<DeviceProfileSwitcherProps> = ({
  className = "",
  showSunlightToggle = true,
}) => {
  const { profile, toggleProfile, toggleSunlightMode, isSunlightHighContrast, isMobile } =
    useDeviceTheme();

  return (
    <div className={`flex items-center gap-1.5 ${className}`} dir="rtl">
      {/* Profile Toggle Button */}
      <button
        onClick={toggleProfile}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
          isMobile
            ? "bg-orange-600 text-white border-orange-500 shadow-sm"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300"
        }`}
        title={isMobile ? "מעבר למצב משרד ודסקטופ" : "מעבר למצב שטח סמסונג"}
      >
        {isMobile ? (
          <>
            <Smartphone className="h-4 w-4 text-white animate-pulse" />
            <span>שטח סמסונג</span>
          </>
        ) : (
          <>
            <Monitor className="h-4 w-4 text-slate-600" />
            <span>משרד ודסקטופ</span>
          </>
        )}
      </button>

      {/* Sun-Proof High Contrast Toggle */}
      {showSunlightToggle && (
        <button
          onClick={toggleSunlightMode}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
            isSunlightHighContrast
              ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
          }`}
          title="הגבר ניגודיות לקריאה באור שמש חזק בחצר"
        >
          <Sun className={`h-4 w-4 ${isSunlightHighContrast ? "text-slate-950 font-bold" : "text-amber-500"}`} />
          <span className="hidden sm:inline">ניגודיות שמש</span>
        </button>
      )}
    </div>
  );
};
