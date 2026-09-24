/**
 * Noa AI Coach & Interactive Guide - App Entry Point
 * ח. סבן חומרי בניין (1994) בע״מ
 */

import React, { useState, useEffect } from "react";
import GuidePage from "../app/guide/page";
import CoachStudioPage from "../app/coach/page";
import PortalPage from "../app/portal/page";
import CatalogStudioPage from "../app/catalog-studio/page";
import ChatPage from "../app/chat/page";
import { DeviceThemeProvider } from "../lib/device-theme-context";
import { InstallPromptBanner } from "../components/pwa/InstallPromptBanner";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      return path === "/" || !path ? "/portal" : path;
    }
    return "/portal";
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path === "/" || !path ? "/portal" : path);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case "/chat":
        return <ChatPage onNavigate={navigateTo} />;
      case "/coach":
        return <CoachStudioPage />;
      case "/catalog-studio":
        return <CatalogStudioPage onNavigate={navigateTo} />;
      case "/guide":
        return <GuidePage onNavigateToCoach={() => navigateTo("/coach")} />;
      case "/portal":
      default:
        return <PortalPage onNavigate={navigateTo} />;
    }
  };

  return (
    <DeviceThemeProvider>
      <InstallPromptBanner />
      {renderContent()}
    </DeviceThemeProvider>
  );
}

