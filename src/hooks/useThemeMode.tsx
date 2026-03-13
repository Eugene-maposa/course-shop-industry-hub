import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const getStoredMode = (): ThemeMode => {
  const stored = localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
};

const applyMode = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", mode === "dark");
  }
};

export const useThemeMode = () => {
  const [mode, setMode] = useState<ThemeMode>(getStoredMode);

  useEffect(() => {
    applyMode(mode);
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  return { mode, setMode };
};
