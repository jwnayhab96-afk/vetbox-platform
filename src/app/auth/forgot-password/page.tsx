"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const SUPPORT_WHATSAPP = "201155278995";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `مرحبًا، أحتاج مساعدة في استعادة كلمة مرور حساب VetBox. البريد الإلكتروني المسجل: ${email.trim()}. من فضلكم تواصلوا معي لإثبات ملكية الحساب. لا أرسل كلمة المرور.`;
    const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
    setWhatsappUrl(whatsappUrl);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Logo size="lg" subtitle="" />
          <h2 className="text-xl font-bold text-foreground">استعادة كلمة المرور</h2>
          <p className="text-xs text-muted-foreground">أدخل بريدك المسجل لإرسال طلب استعادة إلى دعم VetBox عبر واتساب</p>
        </div>

        <Card className="border-border shadow-sm">
          {sent ? (
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-foreground">تم فتح واتساب لطلب المساعدة</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                أرسل الرسالة الجاهزة إلى دعم VetBox على واتساب. تتضمن بريدك ({email}) فقط؛ لا ترسل كلمة مرورك أو رمز التحقق.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
                فتح واتساب وإرسال الطلب
              </a>
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

                <Button type="submit" className="w-full h-11 font-semibold">
                  المتابعة إلى واتساب
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
