"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;
    const code = searchParams.get("code");

    const finishSignIn = async () => {
      const supabase = createClient();
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) router.replace("/auth/login?confirmation=failed");
          return;
        }
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        if (active) router.replace("/auth/login?confirmation=failed");
        return;
      }

      const role = user.user_metadata?.role;
      const destination = role === "veterinarian"
        ? "/veterinarian/verification"
        : role === "admin"
          ? "/admin/dashboard"
          : "/owner/dashboard";
      if (active) router.replace(destination);
    };

    void finishSignIn().catch(() => {
      if (active) router.replace("/auth/login?confirmation=failed");
    });

    return () => { active = false; };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-foreground">جاري استكمال تسجيل الدخول...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CallbackHandler />
    </Suspense>
  );
}
