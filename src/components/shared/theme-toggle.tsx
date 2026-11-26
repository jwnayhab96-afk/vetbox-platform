"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

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
      <div className={`h-8 w-14 shrink-0 rounded-full border border-border bg-muted/40 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      dir="ltr"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      title={theme === "light" ? "تفعيل الوضع الليلي (Dark Mode)" : "تفعيل الوضع النهاري (Light Mode)"}
      aria-label="تبديل مظهر العرض"
      className={`group relative h-8 w-14 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-inset ring-black/10 transition-[box-shadow,transform] duration-500 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none ${
        isDark ? "shadow-lg shadow-indigo-500/30" : "shadow-md shadow-sky-500/30"
      } ${className}`}
    >
      {/* Day sky */}
      <span
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 transition-opacity duration-700 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Night sky */}
      <span
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 transition-opacity duration-700 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Clouds (drift away at night) */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-all duration-700 ease-out ${
          isDark ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <span className="absolute bottom-1 right-2 h-2 w-5 rounded-full bg-white/95" />
        <span className="absolute bottom-1.5 right-3.5 h-2.5 w-2.5 rounded-full bg-white/95" />
        <span className="absolute bottom-1.5 right-2 h-2 w-2 rounded-full bg-white/95" />
        <span className="absolute right-6 top-1.5 h-1.5 w-3 rounded-full bg-white/60" />
      </span>

      {/* Stars (twinkle in at night) */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-all duration-700 ease-out ${
          isDark ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        <span className="absolute left-2.5 top-1.5 h-[3px] w-[3px] animate-pulse rounded-full bg-white motion-reduce:animate-none" />
        <span className="absolute left-5 top-4 h-0.5 w-0.5 animate-pulse rounded-full bg-indigo-200 [animation-delay:400ms] motion-reduce:animate-none" />
        <span className="absolute bottom-1.5 left-3 h-0.5 w-0.5 animate-pulse rounded-full bg-white [animation-delay:800ms] motion-reduce:animate-none" />
        <span className="absolute left-6 top-2 h-0.5 w-0.5 animate-pulse rounded-full bg-white [animation-delay:1200ms] motion-reduce:animate-none" />
        <span className="absolute bottom-2.5 left-6 h-0.5 w-0.5 animate-pulse rounded-full bg-indigo-100 [animation-delay:200ms] motion-reduce:animate-none" />
      </span>

      {/* Glossy highlight on the track */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2.5 top-0.5 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent"
      />

      {/* Sliding knob */}
      <span
        className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
          isDark
            ? "translate-x-6 bg-slate-100 shadow-[0_0_12px_2px_rgba(165,180,252,0.55)]"
            : "translate-x-0 bg-white shadow-[0_0_12px_3px_rgba(251,191,36,0.65)]"
        }`}
      >
        <Sun
          className={`absolute h-[14px] w-[14px] fill-amber-300 text-amber-500 transition-all duration-500 ease-out group-hover:rotate-45 ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute h-[14px] w-[14px] fill-indigo-200 text-indigo-600 transition-all duration-500 ease-out group-hover:-rotate-12 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
