"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDateTime } from "@/lib/utils";
import { Bell, Check, ExternalLink } from "lucide-react";

export default function NotificationsPage() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      if (!active) return;
      setUserId(user.id);
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (active && !error) setNotifications(data || []);
      channel = supabase.channel(`owner-notifications-${user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
          setNotifications((items) => [payload.new as any, ...items.filter((item) => item.id !== (payload.new as any).id)]);
        })
        .subscribe();
    };
    void load();
    return () => {
      active = false;
      if (channel) void createClient().removeChannel(channel);
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    const { error } = await createClient().from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", userId);
    if (!error) setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title="التنبيهات والإشعارات"
        subtitle="متابعة تحديثات الكشوفات الطبية وطلبات الربط"
        role="owner"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-3 md:space-y-4 max-w-4xl w-full">
        {notifications.length === 0 ? (
          <div className="p-10 sm:p-14 text-center rounded-[2rem] border-2 border-dashed border-primary/25 bg-card">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-foreground">لا توجد تنبيهات حالياً</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border border-s-[6px] rounded-3xl overflow-hidden p-0 gap-0 transition-all ${
                notif.is_read
                  ? "bg-card border-border/70 border-s-border"
                  : "bg-primary/5 border-primary/20 border-s-amber-500 shadow-md"
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col gap-4 text-right">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${
                      notif.is_read ? "bg-muted text-muted-foreground" : "bg-primary text-white shadow-sm"
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base leading-relaxed text-foreground">{notif.title}</h4>
                      {!notif.is_read && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
                    <span className="inline-block rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground font-medium mt-1">
                      {formatArabicDateTime(notif.created_at)}
                    </span>
                  </div>
                </div>

                {(notif.link || !notif.is_read) && (
                  <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
                    {notif.link && (
                      <Link href={notif.link} className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-sm font-bold gap-2 min-h-11 px-5 rounded-2xl active:scale-95 transition-transform">
                          عرض
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(notif.id)}
                        className="h-11 w-11 min-h-11 min-w-11 shrink-0 rounded-2xl bg-primary/10 text-primary hover:bg-primary/15 active:scale-95 transition-transform"
                        title="تحديد كمقروء"
                        aria-label="تحديد كمقروء"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
