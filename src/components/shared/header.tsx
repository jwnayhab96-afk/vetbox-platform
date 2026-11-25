"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Plus, Menu, X, Check, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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
    load();
    return () => { active = false; };
  }, [role]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const ownerLinks = [
    { href: "/owner/dashboard", label: "نظرة عامة" },
    { href: "/owner/pets", label: "حيواناتي" },
    { href: "/owner/pets/new", label: "إضافة حيوان" },
    { href: "/owner/reminders", label: "المواعيد والتطعيمات" },
    { href: "/owner/veterinarians", label: "الأطباء المرتبطون" },
    { href: "/owner/notifications", label: "التنبيهات" },
    { href: "/owner/settings", label: "إعدادات الحساب" },
  ];

  return (
    <header className="sticky top-0 z-30 relative flex min-h-16 md:h-20 items-center justify-between gap-2 border-b border-border/80 bg-background/95 px-3 py-2 backdrop-blur-md sm:px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div>
          <h1 className="truncate text-base font-bold leading-tight text-foreground sm:text-xl md:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block md:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Action Button */}
        {action && (
          <Link href={action.href} aria-label={action.label} title={action.label}>
            <Button size="sm" className="gap-1.5 shadow-xs text-xs md:text-sm h-9 md:h-10">
              {action.icon || <Plus className="h-4 w-4" />}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          </Link>
        )}

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

        {role === "owner" && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 rounded-xl md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border-border min-h-[44px] min-w-[44px]"
            aria-label="الإشعارات والتنبيهات"
            aria-expanded={showNotifications}
          >
            <Bell className="h-4 w-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 md:w-96 rounded-2xl border border-border bg-card p-4 shadow-xl z-50 text-right animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-semibold text-sm text-foreground">الإشعارات والتنبيهات</span>
                <span className="text-xs text-muted-foreground">{unreadCount} غير مقروء</span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">لا توجد تنبيهات حالياً.</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        item.is_read
                          ? "bg-muted/30 border-border/60 text-muted-foreground"
                          : "bg-primary/5 border-primary/20 text-foreground"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-foreground text-xs">{item.title}</span>
                        {!item.is_read && (
                          <button
                            onClick={async () => {
                              const { error } = await createClient().from("notifications").update({ is_read: true }).eq("id", item.id);
                              if (!error) setNotifications((items) => items.map((n) => n.id === item.id ? { ...n, is_read: true } : n));
                            }}
                            title="تحديد كمقروء"
                            className="text-primary hover:text-primary-hover"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{item.message}</p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setShowNotifications(false)}
                          className="mt-2 inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          عرض التفاصيل
                          <ExternalLink className="h-3 w-3" />
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

      {role === "owner" && mobileMenuOpen && (
        <nav className="absolute inset-x-3 top-full z-[60] mt-2 space-y-1 rounded-2xl border border-border bg-card p-2 text-right shadow-xl md:hidden">
          {ownerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                pathname === item.href ? "bg-primary text-white" : "text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              await createClient().auth.signOut();
              router.replace("/auth/login");
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </nav>
      )}
    </header>
  );
}
