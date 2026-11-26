"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { User, Stethoscope, Mail, Phone, Lock, Award, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "veterinarian">("owner");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("Cairo");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real Supabase Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (password.length < 6) {
      setErrorMessage("يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: role,
            governorate: governorate,
            license_number: role === "veterinarian" ? licenseNumber.trim() : null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback/`,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("email rate limit exceeded") || error.code === "over_email_send_rate_limit") {
          setErrorMessage("تم تجاوز الحد المؤقت لإرسال رسائل التأكيد. انتظر قليلًا قبل المحاولة مرة أخرى، أو استخدم رابط التأكيد الذي وصلك بالفعل.");
        } else if (error.message.includes("User already registered")) {
          setErrorMessage("هذا البريد الإلكتروني مسجل بالفعل في منصة فيت بوكس. يرجى تسجيل الدخول بدلاً من ذلك.");
        } else if (error.message.includes("Password should be at least")) {
          setErrorMessage("كلمة المرور ضعيفة. يرجى استخدام 6 خانات على الأقل.");
        } else {
          setErrorMessage(error.message || "تعذر إتمام إنشاء الحساب. يرجى المحاولة مرة أخرى.");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        if (!data.session) {
          setSuccessMessage("تم إنشاء حسابك. افتح رسالة التأكيد في بريدك الإلكتروني، ثم سجّل الدخول.");
          return;
        }
        if (role === "veterinarian") {
          router.push("/veterinarian/verification");
        } else {
          router.push("/owner/dashboard");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء إنشاء الحساب.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Logo size="lg" subtitle="" />
          <h2 className="text-2xl sm:text-3xl font-black text-foreground leading-snug">إنشاء حساب جديد في فيت بوكس</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">اختر نوع حسابك للبدء في الرعاية الطبية المنظمة</p>
        </div>

        <Card className="border-border/70 shadow-xl rounded-[2rem] overflow-hidden p-0 gap-0">
          <div className="h-2 w-full bg-primary" />
          <form onSubmit={handleRegister}>
            <CardContent className="p-5 sm:p-8 space-y-6">
              {errorMessage && (
                <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 border-s-4 border-s-rose-500 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-semibold leading-relaxed flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div role="status" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 border-s-4 border-s-emerald-500 text-emerald-800 text-xs sm:text-sm font-semibold leading-relaxed">
                  {successMessage}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2.5 text-right">
                <Label>نوع الحساب</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`flex flex-col items-center justify-center gap-3 min-h-[124px] p-4 rounded-3xl border-2 text-center transition-all active:scale-[0.97] cursor-pointer ${
                      role === "owner"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-4 ring-primary/15 shadow-md"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${role === "owner" ? "bg-primary text-white" : "bg-muted"}`}>
                      <User className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="block text-sm sm:text-base font-extrabold">مربي حيوانات</span>
                      <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">أليفة، خيول، أو مزارع</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("veterinarian")}
                    className={`flex flex-col items-center justify-center gap-3 min-h-[124px] p-4 rounded-3xl border-2 text-center transition-all active:scale-[0.97] cursor-pointer ${
                      role === "veterinarian"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-4 ring-primary/15 shadow-md"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${role === "veterinarian" ? "bg-primary text-white" : "bg-muted"}`}>
                      <Stethoscope className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="block text-sm sm:text-base font-extrabold">طبيب بيطري</span>
                      <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">مرخص ومسجل بالنقابة</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 text-right">
                <div className="space-y-1.5">
                  <Label htmlFor="name" required>الاسم بالكامل</Label>
                  <Input
                    id="name"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === "veterinarian" ? "د. أحمد علي" : "أحمد علي"}
                    className="h-12 rounded-2xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" required>البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      icon={<Mail className="h-4 w-4" />}
                      className="h-12 rounded-2xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" required>رقم الهاتف المحمول</Label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01012345678"
                      icon={<Phone className="h-4 w-4" />}
                      className="h-12 rounded-2xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gov" required>المحافظة</Label>
                  <select
                    id="gov"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 py-2 text-sm cursor-pointer transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="Cairo">القاهرة</option>
                    <option value="Giza">الجيزة</option>
                    <option value="Alexandria">الإسكندرية</option>
                    <option value="Qalyubia">القليوبية</option>
                    <option value="Sharqia">الشرقية</option>
                    <option value="Dakahlia">الدقهلية</option>
                    <option value="Beheira">البحيرة</option>
                    <option value="Gharbia">الغربية</option>
                    <option value="Other">محافظة أخرى</option>
                  </select>
                </div>

                {/* Extra field for veterinarians */}
                {role === "veterinarian" && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 border-s-4 border-s-primary space-y-2 animate-in fade-in">
                    <Label htmlFor="license" required>رقم قيد نقابة الأطباء البيطريين</Label>
                    <Input
                      id="license"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="مثال: EGY-VET-48920"
                      icon={<Award className="h-4 w-4" />}
                      className="h-12 rounded-2xl text-sm"
                    />
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                      سيتم طلب صورة كارنيه النقابة وترخيص مزاولة المهنة لاحقاً في بوابة الاعتماد.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" required>كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 أحرف أو أرقام على الأقل"
                    icon={<Lock className="h-4 w-4" />}
                    className="h-12 rounded-2xl text-sm"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full min-h-12 h-12 rounded-2xl text-base font-bold shadow-md active:scale-[0.98] transition-transform" isLoading={loading}>
                {role === "veterinarian" ? "متابعة تسجيل الطبيب" : "إنشاء الحساب والبدء"}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/30 justify-center text-xs sm:text-sm text-muted-foreground">
            <span>لديك حساب بالفعل؟</span>
            <Link href="/auth/login" className="mr-1.5 inline-flex min-h-11 items-center px-2 rounded-xl font-bold text-primary hover:bg-primary/10 hover:underline">
              تسجيل الدخول
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
