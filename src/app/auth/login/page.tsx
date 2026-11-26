"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Lock, Mail, AlertCircle, PawPrint, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real Supabase Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("لم يتم تأكيد بريدك الإلكتروني بعد. يرجى مراجعة صندوق الوارد في بريدك.");
        } else {
          setErrorMessage(error.message || "تعذر تسجيل الدخول. يرجى التحقق من الاتصال بالإنترنت.");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile) {
          setErrorMessage("تم تسجيل الدخول، لكن لم يتم العثور على ملف الحساب. تواصل مع الدعم لإصلاح إعداد الحساب.");
          await supabase.auth.signOut();
          return;
        }

        const role = profile.role;

        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "veterinarian") {
          router.push("/veterinarian/dashboard");
        } else {
          router.push("/owner/dashboard");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تسجيل الدخول.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background overflow-x-clip">
      {/* ───────── Brand panel (desktop) ───────── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary text-white p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]"
        />
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-10 h-[30rem] w-[30rem] rounded-full bg-secondary/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/25" />
        <PawPrint aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 h-[28rem] w-[28rem] -rotate-12 text-white/[0.07]" />

        <div className="relative z-10 inline-flex self-start rounded-2xl bg-white p-3 shadow-xl shadow-black/20">
          <Logo size="lg" subtitle="" />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/25 backdrop-blur">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h2 className="text-4xl xl:text-5xl font-black font-display leading-[1.2]">
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            تابع السجلات الطبية لحيواناتك وتواصل مع طبيبك البيطري
          </p>
        </div>

        <div className="relative z-10 text-xs font-black font-brand tracking-[0.3em] text-white/70">VETBOX</div>
      </aside>

      {/* ───────── Form side ───────── */}
      <main className="relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-primary/10 via-background to-background lg:from-background">
        <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl lg:hidden" />

        <div className="relative w-full max-w-md space-y-7">
          {/* Brand (mobile / tablet) */}
          <div className="text-center space-y-3 flex flex-col items-center lg:hidden">
            <Logo size="lg" subtitle="" />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground font-display">تسجيل الدخول إلى حسابك</h2>
            <p className="text-sm text-muted-foreground">تابع السجلات الطبية لحيواناتك وتواصل مع طبيبك البيطري</p>
          </div>

          {/* Heading (desktop, form side) */}
          <div className="hidden lg:block text-right space-y-2">
            <span className="block h-1.5 w-14 rounded-full bg-primary" />
            <h2 className="text-3xl font-black text-foreground font-display">تسجيل الدخول إلى حسابك</h2>
          </div>

          {/* Form */}
          <Card className="rounded-[2rem] border-border/70 border-t-4 border-t-primary shadow-2xl shadow-primary/10 overflow-hidden">
            <form onSubmit={handleLogin}>
              <CardContent className="p-6 sm:p-8 space-y-5">
                {errorMessage && (
                  <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 border-s-4 border-s-rose-500 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-start gap-3 leading-relaxed">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-2 text-right">
                  <Label htmlFor="email" className="font-bold">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@vetbox.eg"
                    icon={<Mail className="h-4 w-4" />}
                    className="h-12 rounded-2xl bg-muted/40 focus-visible:bg-card"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password" className="font-bold">كلمة المرور</Label>
                    <Link href="/auth/forgot-password" className="inline-flex min-h-11 items-center rounded-xl px-2 -mx-2 text-xs sm:text-sm font-bold text-primary hover:bg-primary/10 hover:underline">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    className="h-12 rounded-2xl bg-muted/40 focus-visible:bg-card"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full min-h-12 h-12 rounded-2xl text-base font-extrabold shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  isLoading={loading}
                >
                  تسجيل الدخول
                </Button>
              </CardContent>
            </form>

            <CardFooter className="px-6 sm:px-8 py-5 border-t border-border/60 bg-muted/30 justify-center text-sm text-muted-foreground">
              <span>ليس لديك حساب بعد؟</span>
              <Link href="/auth/register" className="mr-1.5 inline-flex min-h-11 items-center rounded-xl px-2 font-extrabold text-primary hover:bg-primary/10 hover:underline">
                أنشئ حساباً جديداً
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
