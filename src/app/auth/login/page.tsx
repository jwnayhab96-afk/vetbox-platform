"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Lock, Mail, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Logo size="lg" subtitle="" />
          <h2 className="text-2xl font-black text-foreground">تسجيل الدخول إلى حسابك</h2>
          <p className="text-xs text-muted-foreground">تابع السجلات الطبية لحيواناتك وتواصل مع طبيبك البيطري</p>
        </div>

        {/* Standard Form */}
        <Card className="border-border shadow-sm">
          <form onSubmit={handleLogin}>
            <CardContent className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5 text-right">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@vetbox.eg"
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-1.5 text-right">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
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
                />
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" isLoading={loading}>
                تسجيل الدخول
              </Button>
            </CardContent>
          </form>

          <CardFooter className="p-6 pt-0 border-t border-border/60 justify-center text-xs text-muted-foreground mt-4">
            <span>ليس لديك حساب بعد؟</span>
            <Link href="/auth/register" className="mr-1.5 font-semibold text-primary hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
