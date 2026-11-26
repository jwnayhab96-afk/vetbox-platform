"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("vetbox-theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("vetbox-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className={`h-10 w-10 rounded-2xl border border-border bg-muted/40 ${className}`} />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`group relative h-10 w-10 overflow-hidden rounded-2xl border-border/80 bg-card/70 backdrop-blur-md shadow-sm hover:bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/15 active:scale-95 transition-all duration-300 ${className}`}
      title={theme === "light" ? "تفعيل الوضع الليلي (Dark Mode)" : "تفعيل الوضع النهاري (Light Mode)"}
      aria-label="تبديل مظهر العرض"
    >
      {/* soft glow that follows the active mode */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          theme === "light"
            ? "bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100"
            : "bg-gradient-to-br from-amber-400/20 to-transparent opacity-100"
        }`}
      />

      {/* cross-fading, rotating icons */}
      <Moon
        className={`absolute h-[18px] w-[18px] text-slate-700 transition-all duration-500 ease-out group-hover:-rotate-12 ${
          theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Sun
        className={`absolute h-[18px] w-[18px] text-amber-400 transition-all duration-500 ease-out group-hover:rotate-45 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}
