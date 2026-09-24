/**
 * Dual-Profile UI Engine & Device Theme Context
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Supports:
 * - Mobile Yard Profile (Samsung/Android in the yard: High contrast, 52px touch targets, big fonts)
 * - Desktop Dispatch Profile (Office & Home: Multi-pane, compact tables, high information density)
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type DeviceProfile = "mobile-samsung" | "desktop-dispatch";

export interface ThemeClasses {
  btnPrimary: string;
  btnSecondary: string;
  textTitle: string;
  textBody: string;
  textMuted: string;
  cardBase: string;
  inputBase: string;
  badgeBase: string;
  containerSpacing: string;
}

interface DeviceThemeContextType {
  profile: DeviceProfile;
  isMobile: boolean;
  isSamsung: boolean;
  isSunlightHighContrast: boolean;
  setProfile: (p: DeviceProfile) => void;
  toggleProfile: () => void;
  toggleSunlightMode: () => void;
  theme: ThemeClasses;
}

const DeviceThemeContext = createContext<DeviceThemeContextType | null>(null);

export const DeviceThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<DeviceProfile>("desktop-dispatch");
  const [isSamsung, setIsSamsung] = useState(false);
  const [isSunlightHighContrast, setIsSunlightHighContrast] = useState(false);
  const [hasUserOverridden, setHasUserOverridden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent.toLowerCase();
    const isSamsungDevice = /samsung/i.test(ua) || /sm-[a-z0-9]+/i.test(ua) || /android/i.test(ua);
    setIsSamsung(isSamsungDevice);

    const savedProfile = localStorage.getItem("saban_ui_profile") as DeviceProfile | null;
    const savedContrast = localStorage.getItem("saban_sunlight_contrast") === "true";
    setIsSunlightHighContrast(savedContrast);

    if (savedProfile) {
      setProfileState(savedProfile);
      setHasUserOverridden(true);
    } else {
      // Auto-detect based on screen width and user-agent
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen || isSamsungDevice) {
        setProfileState("mobile-samsung");
      } else {
        setProfileState("desktop-dispatch");
      }
    }

    const handleResize = () => {
      if (!hasUserOverridden) {
        if (window.innerWidth < 768) {
          setProfileState("mobile-samsung");
        } else {
          setProfileState("desktop-dispatch");
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasUserOverridden]);

  const setProfile = (newProfile: DeviceProfile) => {
    setProfileState(newProfile);
    setHasUserOverridden(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("saban_ui_profile", newProfile);
    }
  };

  const toggleProfile = () => {
    const next = profile === "mobile-samsung" ? "desktop-dispatch" : "mobile-samsung";
    setProfile(next);
  };

  const toggleSunlightMode = () => {
    setIsSunlightHighContrast((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("saban_sunlight_contrast", String(next));
      }
      return next;
    });
  };

  const isMobile = profile === "mobile-samsung";

  const theme: ThemeClasses = useMemo(() => {
    if (isMobile) {
      return {
        btnPrimary:
          "min-h-[52px] text-lg font-bold px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-lg active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer",
        btnSecondary:
          "min-h-[52px] text-base font-bold px-5 py-3 rounded-2xl bg-white border-2 border-slate-300 text-slate-800 hover:bg-slate-50 active:bg-slate-100 shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer",
        textTitle: "text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight",
        textBody: "text-lg text-slate-900 font-semibold leading-relaxed",
        textMuted: "text-base text-slate-600 font-medium",
        cardBase: `p-5 rounded-2xl bg-white border-2 ${
          isSunlightHighContrast ? "border-slate-800 shadow-xl" : "border-slate-200 shadow-md"
        } transition-all`,
        inputBase:
          "min-h-[52px] text-lg font-semibold px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white text-slate-900 focus:border-orange-500 focus:outline-none shadow-inner",
        badgeBase:
          "px-3 py-1.5 text-sm font-bold rounded-xl border border-slate-300 bg-slate-100 text-slate-800",
        containerSpacing: "space-y-5 px-3 py-4 max-w-lg mx-auto",
      };
    }

    // Desktop Dispatch Profile
    return {
      btnPrimary:
        "min-h-[40px] text-sm font-semibold px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer",
      btnSecondary:
        "min-h-[40px] text-sm font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer",
      textTitle: "text-xl font-bold text-slate-900",
      textBody: "text-sm text-slate-700 leading-normal",
      textMuted: "text-xs text-slate-500",
      cardBase: "p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs hover:shadow-md transition-all",
      inputBase:
        "min-h-[40px] text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-orange-500 focus:outline-none",
      badgeBase: "px-2 py-0.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700",
      containerSpacing: "space-y-4 px-6 py-6 max-w-7xl mx-auto",
    };
  }, [isMobile, isSunlightHighContrast]);

  return (
    <DeviceThemeContext.Provider
      value={{
        profile,
        isMobile,
        isSamsung,
        isSunlightHighContrast,
        setProfile,
        toggleProfile,
        toggleSunlightMode,
        theme,
      }}
    >
      <div
        data-theme-profile={profile}
        data-sunlight-mode={isSunlightHighContrast}
        className={isSunlightHighContrast ? "contrast-110 saturate-125" : ""}
      >
        {children}
      </div>
    </DeviceThemeContext.Provider>
  );
};

export function useDeviceTheme() {
  const ctx = useContext(DeviceThemeContext);
  if (!ctx) {
    throw new Error("useDeviceTheme must be used within a DeviceThemeProvider");
  }
  return ctx;
}
