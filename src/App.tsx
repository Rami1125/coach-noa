/**
 * Noa AI Coach & Interactive Guide - App Entry Point
 * ח. סבן חומרי בניין (1994) בע״מ
 */

import React, { useState, useEffect } from "react";
import GuidePage from "../app/guide/page";
import CoachStudioPage from "../app/coach/page";

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  };

  if (currentPath === "/coach") {
    return <CoachStudioPage />;
  }

  return <GuidePage onNavigateToCoach={() => navigateTo("/coach")} />;
}

