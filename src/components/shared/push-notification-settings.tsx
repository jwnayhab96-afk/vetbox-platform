"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, LoaderCircle, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function decodeApplicationServerKey(key: string) {
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export function PushNotificationSettings() {
  const [state, setState] = useState<"loading" | "unconfigured" | "unsupported" | "off" | "on" | "denied" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        if (alive) setState("unconfigured");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !window.isSecureContext) {
        if (alive) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (alive) setState("denied");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const subscription = await registration?.pushManager.getSubscription();
        if (alive) setState(subscription ? "on" : "off");
      } catch {
        if (alive) setState("error");
      }
    };
    void check();
    return () => { alive = false; };
  }, []);

  const enable = async () => {
    setBusy(true);
    setMessage("");
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("إعداد الإشعارات لم يكتمل بعد.");
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("سجّل الدخول أولاً لتفعيل الإشعارات.");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        setMessage(permission === "denied" ? "الإذن مرفوض من إعدادات المتصفح." : "لم يتم منح الإذن.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeApplicationServerKey(publicKey),
      });
      const json = subscription.toJSON();
      const endpoint = subscription.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!endpoint || !p256dh || !auth) throw new Error("تعذر قراءة بيانات جهازك.");

      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      }, { onConflict: "endpoint" });
      if (error) throw error;
      setState("on");
      setMessage("تم تفعيل إشعارات الهاتف لهذا الجهاز.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "تعذر تفعيل الإشعارات حالياً.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const supabase = createClient();
        const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        if (error) throw error;
        await subscription.unsubscribe();
      }
      setState("off");
      setMessage("تم إيقاف إشعارات هذا الجهاز.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر إيقاف الإشعارات.");
    } finally {
      setBusy(false);
    }
  };

  const sendDisplayTest = async () => {
    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("اختبار إشعارات VetBox", {
        body: "إذا ظهر هذا التنبيه، فـ Chrome وAndroid يسمحان بعرض إشعارات الموقع.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "vetbox-local-notification-test",
        dir: "rtl",
        lang: "ar",
      });
      setMessage("تم طلب عرض إشعار اختبار محلي. هذا الاختبار لا يمر عبر Supabase.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر عرض إشعار الاختبار.");
    } finally {
      setBusy(false);
    }
  };

  const iosInstallHint = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent) && !("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

  return (
    <section className="border-b border-border/70 bg-muted/20 px-4 py-3 text-right" dir="rtl">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {state === "on" ? <Check className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground">إشعارات الهاتف</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {state === "on" ? "ستصلك التنبيهات حتى عند إغلاق الموقع." : state === "unconfigured" ? "إشعارات الهاتف قيد الإعداد." : "استقبل تنبيهات المواعيد والرسائل على جهازك."}
          </p>
        </div>
        {state === "loading" || busy ? <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        {state === "off" && !busy && (
          <button onClick={enable} className="min-h-9 shrink-0 rounded-xl bg-primary px-3 text-xs font-bold text-white hover:bg-primary/90">
            تفعيل
          </button>
        )}
        {state === "on" && !busy && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={sendDisplayTest} className="min-h-9 rounded-xl border border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/5">
              اختبار
            </button>
            <button onClick={disable} className="min-h-9 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted">
              إيقاف
            </button>
          </div>
        )}
        {state === "denied" && <span className="text-[11px] font-semibold text-muted-foreground">الإذن مرفوض</span>}
        {state === "unconfigured" && <span className="text-[11px] text-muted-foreground">قريباً</span>}
        {state === "unsupported" && <span className="text-[11px] text-muted-foreground">غير مدعوم هنا</span>}
        {state === "error" && !busy && <button onClick={enable} className="min-h-9 shrink-0 rounded-xl border border-border px-3 text-xs font-semibold">إعادة المحاولة</button>}
      </div>
      {iosInstallHint && state !== "on" && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          على iPhone: أضف VetBox إلى الشاشة الرئيسية من قائمة المشاركة، ثم افتحه واضغط «تفعيل».
        </p>
      )}
      {message && <p role="status" className="mt-2 text-[11px] text-muted-foreground">{message}</p>}
    </section>
  );
}
