"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate } from "@/lib/utils";
import { getFunctionErrorMessage } from "@/lib/supabase/function-error";
import { Users, Search, Shield, User, Stethoscope } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noticeAudience, setNoticeAudience] = useState("all");
  const [noticeRecipient, setNoticeRecipient] = useState("");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeBusy, setNoticeBusy] = useState(false);
  const [passwordRecipient, setPasswordRecipient] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");
  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      const { data, error } = await createClient().functions.invoke("platform-actions", { body: { action: "list_users" } });
      if (!active) return;
      if (error || data?.error) {
        setError(await getFunctionErrorMessage(error, data, "تعذر تحميل المستخدمين"));
      } else {
        const rows = (data?.users || []).map((account: any) => ({
          ...account.profile,
          id: account.id,
          email: account.email,
          auth_phone: account.auth_phone,
          email_confirmed_at: account.email_confirmed_at,
          last_sign_in_at: account.last_sign_in_at,
          auth_created_at: account.auth_created_at,
          veterinarian: account.veterinarian,
          pets: account.pets || [],
          profile_missing: !account.profile,
        }));
        rows.sort((a: any, b: any) => new Date(b.auth_created_at || 0).getTime() - new Date(a.auth_created_at || 0).getTime());
        setUsers(rows);
      }
      setLoading(false);
    };
    void loadUsers();
    return () => { active = false; };
  }, []);

  const filtered = users.filter((u) => {
    return (
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.governorate || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    setNoticeBusy(true); setActionFeedback("");
    const { data, error } = await createClient().functions.invoke("platform-actions", {
      body: {
        action: "send_notification",
        audience: noticeAudience,
        targetUserId: noticeAudience === "user" ? noticeRecipient : undefined,
        title: noticeTitle,
        message: noticeMessage,
      },
    });
    setNoticeBusy(false);
    if (error || data?.error) { setActionFeedback(await getFunctionErrorMessage(error, data)); return; }
    setActionFeedback(`تم إرسال الإشعار إلى ${data.count} حساب.`);
    setNoticeTitle(""); setNoticeMessage(""); setNoticeRecipient("");
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordBusy(true); setActionFeedback("");
    const { data, error } = await createClient().functions.invoke("platform-actions", {
      body: { action: "set_password", targetUserId: passwordRecipient, password: newPassword },
    });
    setPasswordBusy(false);
    if (error || data?.error) { setActionFeedback(await getFunctionErrorMessage(error, data)); return; }
    setActionFeedback("تم تغيير كلمة مرور الحساب."); setNewPassword("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="إدارة مستخدمي المنصة"
        subtitle="استعراض حسابات المربين، الأطباء، والمشرفين"
        role="admin"
      />

      <div className="p-4 md:p-8 space-y-6 max-w-6xl">
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">تعذر تحميل المستخدمين من Supabase</p><p dir="ltr" className="mt-1 break-all text-xs">{error}</p></div>}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <Card className="border-border p-5">
            <CardContent className="p-0">
              <h2 className="font-bold text-base mb-4">إرسال إشعار من الإدارة</h2>
              <form onSubmit={handleSendNotification} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="noticeAudience">المستلمون</Label>
                  <select id="noticeAudience" value={noticeAudience} onChange={(e) => setNoticeAudience(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">كل حسابات المنصة</option>
                    <option value="user">شخص محدد</option>
                  </select>
                </div>
                {noticeAudience === "user" && <div className="space-y-1.5">
                  <Label htmlFor="noticeRecipient">اختر الحساب</Label>
                  <select id="noticeRecipient" required value={noticeRecipient} onChange={(e) => setNoticeRecipient(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">اختر مستخدمًا</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.email || user.full_name} — {user.full_name || "اسم غير متوفر"}</option>)}
                  </select>
                </div>}
                <div className="space-y-1.5"><Label htmlFor="noticeTitle">عنوان الإشعار</Label><Input id="noticeTitle" maxLength={120} required value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="noticeMessage">نص الإشعار</Label><Textarea id="noticeMessage" maxLength={2000} required rows={3} value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} /></div>
                <Button type="submit" isLoading={noticeBusy}>إرسال الإشعار</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border p-5">
            <CardContent className="p-0">
              <h2 className="font-bold text-base mb-4">تغيير كلمة مرور مستخدم</h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="passwordRecipient">الحساب</Label>
                  <select id="passwordRecipient" required value={passwordRecipient} onChange={(e) => setPasswordRecipient(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">اختر مستخدمًا</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.email || user.full_name} — {user.full_name || "اسم غير متوفر"}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <Input id="newPassword" type="password" minLength={8} autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">8 أحرف على الأقل. ستصبح فعالة فور الحفظ.</p>
                </div>
                <Button type="submit" variant="outline" isLoading={passwordBusy}>تغيير كلمة المرور</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {actionFeedback && <p role="status" className="rounded-lg bg-muted p-3 text-sm">{actionFeedback}</p>}
        <div className="max-w-md">
          <Input
            placeholder="ابحث بالاسم، البريد، الهاتف، أو المحافظة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/60">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">الدور</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">الموقع</th>
                  <th className="p-3.5">تاريخ التسجيل</th>
                  <th className="p-3.5">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!loading && !error && filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{users.length ? "لا توجد نتائج مطابقة للبحث." : "لا توجد حسابات مسجلة لعرضها."}</td></tr>}
                {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">جارٍ تحميل المستخدمين...</td></tr>}
                {filtered.map((user) => (
                  <tr key={user.id} className={`hover:bg-muted/30 transition-colors ${selectedUser?.id === user.id ? "bg-primary/5" : ""}`}>
                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.role === "veterinarian" ? <Stethoscope className="h-4 w-4" /> : user.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <span>{user.full_name || "اسم غير متوفر"}</span>
                    </td>
                    <td className="p-3.5 font-mono text-left" dir="ltr">{user.email || "—"}</td>
                    <td className="p-3.5">
                      <Badge variant={user.role === "veterinarian" ? "secondary" : user.role === "admin" ? "default" : "outline"}>
                        {user.role === "owner" ? "مربي" : user.role === "veterinarian" ? "طبيب" : "مشرف"}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono">{user.phone || "-"}</td>
                    <td className="p-3.5">{user.city ? `${user.city}، ${user.governorate}` : user.governorate}</td>
                    <td className="p-3.5 text-muted-foreground">{formatArabicDate(user.auth_created_at || user.created_at)}</td>
                    <td className="p-3.5"><Button type="button" size="sm" variant="outline" onClick={() => setSelectedUser(user)}>عرض</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        {selectedUser && <Card className="border-primary/30 shadow-sm">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 className="text-lg font-bold">تفاصيل الحساب</h2><p className="text-xs text-muted-foreground">{selectedUser.full_name || "اسم غير متوفر"}</p></div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => { setNoticeAudience("user"); setNoticeRecipient(selectedUser.id); document.getElementById("noticeTitle")?.focus(); }}>إرسال إشعار</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setPasswordRecipient(selectedUser.id); document.getElementById("newPassword")?.focus(); }}>تغيير كلمة المرور</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>إغلاق</Button>
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">البريد الإلكتروني</dt><dd dir="ltr" className="mt-1 break-all text-left font-medium">{selectedUser.email || "غير مسجل"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">حالة تأكيد البريد</dt><dd className="mt-1 font-medium">{selectedUser.email_confirmed_at ? "مؤكد" : "غير مؤكد"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">الدور</dt><dd className="mt-1 font-medium">{selectedUser.role === "owner" ? "مربي" : selectedUser.role === "veterinarian" ? "طبيب بيطري" : selectedUser.role === "admin" ? "إدارة" : "غير محدد"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">الاسم</dt><dd className="mt-1 font-medium">{selectedUser.full_name || "غير مسجل"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">الهاتف</dt><dd className="mt-1 font-medium">{selectedUser.phone || selectedUser.auth_phone || "غير مسجل"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">الموقع</dt><dd className="mt-1 font-medium">{[selectedUser.city, selectedUser.governorate].filter(Boolean).join("، ") || "غير مسجل"}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">تاريخ إنشاء الحساب</dt><dd className="mt-1 font-medium">{formatArabicDate(selectedUser.auth_created_at || selectedUser.created_at)}</dd></div>
              <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">آخر تسجيل دخول</dt><dd className="mt-1 font-medium">{selectedUser.last_sign_in_at ? formatArabicDate(selectedUser.last_sign_in_at) : "لم يسجل الدخول بعد"}</dd></div>
              {selectedUser.profile_missing && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900"><dt className="text-xs">ملف المنصة</dt><dd className="mt-1 font-medium">لا يوجد سجل مقابل في profiles</dd></div>}
            </dl>
            {selectedUser.role === "veterinarian" && selectedUser.veterinarian && <section className="space-y-2 border-t border-border pt-4">
              <h3 className="font-bold">البيانات المهنية</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">رقم القيد</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.license_number || "غير مسجل"}</dd></div>
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">حالة الترخيص</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.verification_status || "غير محددة"}</dd></div>
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">العيادة</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.clinic_affiliation_name || "غير مسجلة"}</dd></div>
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">التعليم</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.education || "غير مسجل"}</dd></div>
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">سنوات الخبرة</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.years_of_experience ?? "غير مسجلة"}</dd></div>
                <div className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">التخصصات</dt><dd className="mt-1 font-medium">{selectedUser.veterinarian.specializations?.join("، ") || "غير مسجلة"}</dd></div>
              </dl>
            </section>}
            {selectedUser.role === "owner" && <section className="space-y-2 border-t border-border pt-4">
              <h3 className="font-bold">حيوانات المربي ({selectedUser.pets.length})</h3>
              {selectedUser.pets.length ? <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {selectedUser.pets.map((pet: any) => <li key={pet.id} className="rounded-lg bg-muted/50 p-3">{pet.name} — {pet.species}{pet.breed ? `، ${pet.breed}` : ""}</li>)}
              </ul> : <p className="text-sm text-muted-foreground">لا توجد حيوانات مسجلة.</p>}
            </section>}
          </CardContent>
        </Card>}
      </div>
    </div>
  );
}
