"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Plus, Menu, X, Check, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PushNotificationSettings } from "@/components/shared/push-notification-settings";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  role: "owner" | "veterinarian" | "admin";
}

export function Header({ title, subtitle, action, role }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (active) setNotifications(data || []);
    };
    void load();
    const refreshTimer = window.setInterval(() => { void load(); }, 20_000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, [role]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const navLinks = {
    owner: [
    { href: "/owner/dashboard", label: "نظرة عامة" },
    { href: "/owner/pets", label: "حيواناتي" },
    { href: "/owner/pets/new", label: "إضافة حيوان" },
    { href: "/owner/reminders", label: "المواعيد والتطعيمات" },
    { href: "/owner/veterinarians", label: "الأطباء المرتبطون" },
    { href: "/owner/notifications", label: "التنبيهات" },
    { href: "/owner/settings", label: "إعدادات الحساب" },
    ],
    veterinarian: [
      { href: "/veterinarian/dashboard", label: "لوحة الطبيب" },
      { href: "/veterinarian/patients", label: "المرضى والحالات" },
      { href: "/veterinarian/visits/new", label: "تسجيل كشف" },
      { href: "/veterinarian/connection-requests", label: "طلبات الربط" },
      { href: "/veterinarian/notifications", label: "إشعارات العملاء" },
      { href: "/veterinarian/verification", label: "اعتماد الترخيص" },
      { href: "/veterinarian/profile", label: "الملف المهني" },
      { href: "/veterinarian/settings", label: "الإعدادات" },
    ],
    admin: [
      { href: "/admin/dashboard", label: "لوحة الإدارة" },
      { href: "/admin/veterinarians", label: "اعتماد الأطباء" },
      { href: "/admin/users", label: "المستخدمون" },
      { href: "/admin/storage", label: "تخزين صور الحيوانات" },
      { href: "/admin/clinics", label: "العيادات" },
      { href: "/admin/articles", label: "المقالات" },
      { href: "/admin/reports", label: "التقارير" },
      { href: "/admin/settings", label: "الإعدادات" },
    ],
  }[role];

  return (
    <header className="sticky top-0 z-30 flex min-h-16 md:h-20 items-center justify-between gap-2 border-b-2 border-border/60 bg-background/95 px-3 py-2 shadow-sm backdrop-blur-md sm:px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="min-w-0 border-s-4 border-s-primary ps-3 text-right sm:ps-4">
          <h1 className="line-clamp-2 md:line-clamp-1 font-display text-base font-extrabold leading-tight text-foreground sm:text-xl md:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block md:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Action Button */}
        {action && (
          <Link href={action.href} aria-label={action.label} title={action.label}>
            <Button size="sm" className="h-11 min-w-11 gap-1.5 rounded-2xl px-3 text-xs font-bold shadow-md transition-all active:scale-95 sm:px-4 md:text-sm">
              {action.icon || <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          </Link>
        )}

        {/* Dark / Light Theme Toggle */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 min-h-11 min-w-11 rounded-2xl border-border bg-card transition-all active:scale-95 md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-11 w-11 min-h-[44px] min-w-[44px] rounded-2xl border-border bg-card transition-all active:scale-95"
            aria-label="الإشعارات والتنبيهات"
            aria-expanded={showNotifications}
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-background">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-border/70 bg-card text-right shadow-xl animate-in fade-in slide-in-from-top-2 md:w-96">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-primary/5 px-4 py-3">
                <span className="flex min-w-0 items-center gap-2.5 text-sm font-extrabold text-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <Bell className="h-4 w-4" />
                  </span>
                  <span className="truncate">الإشعارات والتنبيهات</span>
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{unreadCount} غير مقروء</span>
              </div>

              <PushNotificationSettings />

              <div className="max-h-[min(24rem,60dvh)] space-y-2 overflow-y-auto p-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <Bell className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">لا توجد تنبيهات حالياً.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-3 text-xs transition-colors ${
                        item.is_read
                          ? "border-border/60 bg-muted/30 text-muted-foreground"
                          : "border-primary/20 border-s-4 border-s-amber-500 bg-primary/5 text-foreground"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold leading-relaxed text-foreground">{item.title}</span>
                        {!item.is_read && (
                          <button
                            onClick={async () => {
                              const { error } = await createClient().from("notifications").update({ is_read: true }).eq("id", item.id);
                              if (!error) setNotifications((items) => items.map((n) => n.id === item.id ? { ...n, is_read: true } : n));
                            }}
                            title="تحديد كمقروء"
                            aria-label="تحديد كمقروء"
                            className="-m-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover active:scale-95"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{item.message}</p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setShowNotifications(false)}
                          className="mt-2.5 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary/10 px-3.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
                        >
                          عرض التفاصيل
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="absolute inset-x-3 top-full z-[60] mt-2 max-h-[calc(100dvh-5rem)] space-y-1 overflow-y-auto rounded-3xl border border-border/70 bg-card p-2 text-right shadow-xl animate-in fade-in slide-in-from-top-2 md:hidden">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`flex min-h-12 items-center rounded-2xl px-4 text-sm font-bold transition-all active:scale-[0.98] ${
                pathname === item.href ? "bg-primary text-white shadow-sm" : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex-1">{item.label}</span>
              {pathname === item.href && <span className="h-2 w-2 shrink-0 rounded-full bg-white/90" />}
            </Link>
          ))}
          <div className="mt-2 flex min-h-12 items-center justify-between rounded-2xl bg-muted/40 px-4 py-1.5 text-sm font-bold text-foreground">
            <span>المظهر</span>
            <ThemeToggle />
          </div>
          <div className="my-1 h-px bg-border/60" />
          <button
            type="button"
            onClick={async () => {
              await createClient().auth.signOut();
              router.replace("/auth/login");
            }}
            className="flex min-h-12 w-full items-center gap-2.5 rounded-2xl px-4 text-sm font-bold text-rose-600 transition-all hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </nav>
      )}
    </header>
  );
}
