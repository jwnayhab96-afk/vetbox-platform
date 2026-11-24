"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/data/store";
import { formatArabicDateTime } from "@/lib/utils";
import { Bell, Check, ExternalLink } from "lucide-react";

export default function NotificationsPage() {
  const currentProfile = store.getCurrentProfile();
  const [notifications, setNotifications] = useState(() => store.getNotifications(currentProfile.id));

  const handleMarkRead = (id: string) => {
    store.markNotificationAsRead(id);
    setNotifications([...store.getNotifications(currentProfile.id)]);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="التنبيهات والإشعارات"
        subtitle="متابعة تحديثات الكشوفات الطبية وطلبات الربط"
        role="owner"
      />

      <div className="p-4 md:p-8 space-y-4 max-w-4xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/60">
            <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">لا توجد تنبيهات حالياً</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border transition-all ${
                notif.is_read ? "bg-card border-border/80" : "bg-primary/5 border-primary/20 shadow-xs"
              }`}
            >
              <CardContent className="p-5 flex items-start justify-between gap-4 text-right">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground/80 block pt-1">
                    {formatArabicDateTime(notif.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.link && (
                    <Link href={notif.link}>
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        عرض
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                  {!notif.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkRead(notif.id)}
                      className="h-8 w-8 text-primary"
                      title="تحديد كمقروء"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
