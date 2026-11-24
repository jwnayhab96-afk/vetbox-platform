"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Logo size="lg" subtitle="" />
          <h2 className="text-xl font-bold text-foreground">استعادة كلمة المرور</h2>
          <p className="text-xs text-muted-foreground">أدخل بريدك الإلكتروني المسجل لإرسال رابط تعيين كلمة مرور جديدة</p>
        </div>

        <Card className="border-border shadow-sm">
          {sent ? (
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">تم إرسال الرابط بنجاح</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                إذا كان البريد ({email}) مسجلاً لدينا، فستصلك رسالة تحتوي على تعليمات إعادة تعيين كلمة المرور خلال دقائق.
              </p>
              <Link href="/auth/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4 text-right">
                <div className="space-y-1.5">
                  <Label htmlFor="email" required>البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@vetbox.eg"
                    icon={<Mail className="h-4 w-4" />}
                  />
                </div>

                <Button type="submit" className="w-full h-11 font-semibold" isLoading={loading}>
                  إرسال رابط الاستعادة
                </Button>
              </CardContent>
              <CardFooter className="p-6 pt-0 border-t border-border/60 justify-center text-xs text-muted-foreground mt-4">
                <Link href="/auth/login" className="flex items-center gap-1 text-primary hover:underline font-medium">
                  <ArrowRight className="h-3.5 w-3.5" />
                  الرجوع إلى صفحة تسجيل الدخول
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
