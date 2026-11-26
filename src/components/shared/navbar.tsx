"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import {
  Menu,
  X,
  Stethoscope,
  BookOpen,
  MapPin,
  Shield,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUser(user);
      } catch {
        // Fallback to guest
      }
    }
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAuthUser(null);
    } catch {
      // Ignored
    }
  };

  const navLinks = [
    { href: "/clinics", label: "العيادات والمستشفيات", icon: MapPin },
    { href: "/veterinarians", label: "الأطباء البيطريين", icon: Stethoscope },
    { href: "/learn", label: "المعرفة البيطرية", icon: BookOpen },
    { href: "/about", label: "عن فيت بوكس", icon: Shield },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border/60 bg-background/90 shadow-sm backdrop-blur-md transition-all">
      {/* Top micro bar for emergency hotline */}
      <div className="bg-primary py-1.5 px-4 text-xs text-white font-medium hidden sm:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-white font-bold">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
              خدمة الرعاية البيطرية الرقمية الأولى في مصر
            </span>
            <span className="text-white/80">• تغطية شاملة للقاهرة، الجيزة، والإسكندرية</span>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <a href="mailto:johnehab.m@gmail.com" className="flex items-center gap-1 text-white hover:underline font-sans">
              <span>johnehab.m@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container flex h-16 md:h-20 items-center justify-between">
        {/* Official Brand Logo (English-only with distinctive font) */}
        <span className="sm:hidden"><Logo size="sm" subtitle="" /></span>
        <span className="hidden sm:inline-flex"><Logo size="md" subtitle="" /></span>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-card p-1.5 rounded-2xl border border-border/70 shadow-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 min-h-11 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-white shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-muted-foreground"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Fast Dashboard Switches */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/owner/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-sm min-h-11 px-4 font-semibold rounded-2xl border-border/80 hover:border-primary/50">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              لوحة المربي
            </Button>
          </Link>
          <Link href="/veterinarian/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-sm min-h-11 px-4 font-semibold text-muted-foreground hover:text-foreground rounded-2xl">
              <Stethoscope className="h-3.5 w-3.5 text-secondary" />
              بوابة الطبيب
            </Button>
          </Link>
          {authUser ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-1.5 text-sm min-h-11 px-5 font-bold rounded-2xl border-rose-300/60 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 active:scale-95 transition-transform"
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm" className="gap-1.5 shadow-md font-bold text-sm min-h-11 px-5 rounded-2xl bg-primary hover:bg-primary-hover text-white active:scale-95 transition-transform">
                <User className="h-3.5 w-3.5" />
                دخول / تسجيل
              </Button>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/owner/dashboard">
            <Button size="icon" variant="outline" className="h-11 w-11 min-h-11 min-w-11 rounded-2xl bg-card" aria-label="لوحة المربي" title="لوحة المربي">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-2xl border border-border bg-card text-foreground hover:bg-muted active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="القائمة الرئيسية"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mx-3 mb-3 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-3xl border border-border/70 bg-card p-3 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between min-h-12 rounded-2xl bg-muted/50 px-4 py-1.5 text-sm font-bold">
            <span>المظهر</span>
            <ThemeToggle />
          </div>
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 min-h-12 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98] ${
                    active
                      ? "bg-primary text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/20" : "bg-muted"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full min-h-12 px-4 rounded-2xl bg-primary text-white font-bold text-sm text-center shadow-md active:scale-[0.98]"
            >
              <LayoutDashboard className="h-4 w-4" />
              لوحة تحكم المربي
            </Link>
            <Link
              href="/veterinarian/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full min-h-12 px-4 rounded-2xl border border-border text-foreground font-bold text-sm text-center hover:bg-muted active:scale-[0.98]"
            >
              <Stethoscope className="h-4 w-4 text-primary" />
              بوابة الطبيب البيطري
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full min-h-11 px-4 rounded-2xl text-xs text-muted-foreground text-center hover:bg-muted hover:underline"
            >
              <Shield className="h-3.5 w-3.5" />
              لوحة إدارة المنظومة
            </Link>
            {authUser ? (
              <button
                type="button"
                onClick={async () => {
                  await handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full min-h-12 px-4 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-500/10 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full min-h-12 px-4 rounded-2xl bg-primary text-white font-bold text-sm text-center shadow-md active:scale-[0.98]"
              >
                <User className="h-4 w-4" />
                دخول / تسجيل
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
