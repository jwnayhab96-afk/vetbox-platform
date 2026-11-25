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
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
      {/* Top micro bar for emergency hotline */}
      <div className="bg-primary/5 border-b border-primary/10 py-1 px-4 text-[11px] text-foreground font-medium hidden sm:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-primary font-semibold">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              خدمة الرعاية البيطرية الرقمية الأولى في مصر
            </span>
            <span className="text-muted-foreground">• تغطية شاملة للقاهرة، الجيزة، والإسكندرية</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="mailto:johnehab.m@gmail.com" className="flex items-center gap-1 text-primary hover:underline font-sans">
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
        <nav className="hidden lg:flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-card text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Fast Dashboard Switches */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/owner/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold rounded-xl border-border/80 hover:border-primary/50">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              لوحة المربي
            </Button>
          </Link>
          <Link href="/veterinarian/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl">
              <Stethoscope className="h-3.5 w-3.5 text-secondary" />
              بوابة الطبيب
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="default" size="sm" className="gap-1.5 shadow-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white">
              <User className="h-3.5 w-3.5" />
              دخول / تسجيل
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <Link href="/owner/dashboard">
            <Button size="icon" variant="outline" className="h-10 w-10 min-h-10 min-w-10 rounded-xl" aria-label="لوحة المربي" title="لوحة المربي">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="القائمة الرئيسية"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-card px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm font-semibold">
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm text-center shadow-xs"
            >
              <LayoutDashboard className="h-4 w-4" />
              لوحة تحكم المربي
            </Link>
            <Link
              href="/veterinarian/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-border text-foreground font-semibold text-sm text-center hover:bg-muted"
            >
              <Stethoscope className="h-4 w-4 text-primary" />
              بوابة الطبيب البيطري
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-xs text-muted-foreground text-center hover:underline"
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
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm text-center"
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
