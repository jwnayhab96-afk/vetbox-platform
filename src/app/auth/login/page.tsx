"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Lock, Mail, Sparkles, User, Stethoscope, ShieldCheck } from "lucide-react";
import { store } from "@/lib/data/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ahmed@vetbox.eg");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Default to owner dashboard
      store.setCurrentRole("owner");
      router.push("/owner/dashboard");
    }, 600);
  };

  const handleDemoLogin = (role: "owner" | "veterinarian" | "admin") => {
    setLoading(true);
    store.setCurrentRole(role);
    if (role === "owner") {
      router.push("/owner/dashboard");
    } else if (role === "veterinarian") {
      router.push("/veterinarian/dashboard");
    } else {
      router.push("/admin/dashboard");
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

        {/* Demo One-Click Access Banner */}
        <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-2.5 text-right">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              دخول تجريبي فوري (بدون كلمة سر):
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("owner")}
              className="text-xs flex items-center gap-1 py-1.5 h-auto bg-card hover:border-primary"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              حساب مربي
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("veterinarian")}
              className="text-xs flex items-center gap-1 py-1.5 h-auto bg-card hover:border-secondary"
            >
              <Stethoscope className="h-3.5 w-3.5 text-secondary" />
              طبيب بيطري
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("admin")}
              className="text-xs flex items-center gap-1 py-1.5 h-auto bg-card hover:border-amber-500"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              مشرف النظام
            </Button>
          </div>
        </div>

        {/* Standard Form */}
        <Card className="border-border shadow-sm">
          <form onSubmit={handleLogin}>
            <CardContent className="p-6 space-y-4">
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
