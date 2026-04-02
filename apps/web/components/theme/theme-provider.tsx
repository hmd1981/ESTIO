"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useEffect } from "react";
import { type ThemeMode } from "@/lib/theme/constants";
import { applyThemeDom } from "@/lib/theme/apply-theme-dom";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: ThemeMode | null;
}) {
  useEffect(() => {
    applyThemeDom("dark");
  }, [initialTheme]);

  const value = useMemo(
    () => ({
      theme: "dark" as ThemeMode,
      setTheme: () => applyThemeDom("dark"),
      toggleTheme: () => applyThemeDom("dark"),
    }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
