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
      <div className={`h-9 w-9 rounded-xl border border-border bg-muted/40 ${className}`} />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`h-9 w-9 rounded-xl border-border bg-card/60 backdrop-blur-xs hover:bg-muted transition-all relative ${className}`}
      title={theme === "light" ? "تفعيل الوضع الليلي (Dark Mode)" : "تفعيل الوضع النهاري (Light Mode)"}
      aria-label="تبديل مظهر العرض"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      )}
    </Button>
  );
}
