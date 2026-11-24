"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Menu, X, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { store } from "@/lib/data/store";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const currentProfile = store.getCurrentProfile();
  const notifications = store.getNotifications(currentProfile.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-md px-4 md:px-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Action Button */}
        {action && (
          <Link href={action.href}>
            <Button size="sm" className="gap-1.5 shadow-xs text-xs md:text-sm h-9 md:h-10">
              {action.icon || <Plus className="h-4 w-4" />}
              <span>{action.label}</span>
            </Button>
          </Link>
        )}

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />

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
                            onClick={() => store.markNotificationAsRead(item.id)}
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
    </header>
  );
}
