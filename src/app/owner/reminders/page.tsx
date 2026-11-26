"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate, REMINDER_TYPE_LABELS } from "@/lib/utils";
import {
  getGoogleCalendarUrl,
  downloadIcsFile,
  downloadAllRemindersIcs,
  CalendarEvent,
} from "@/lib/utils/calendar";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  Download,
  Share2,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { triggerConfetti } from "@/components/ui/motion";

export default function RemindersPage() {
  const [userId, setUserId] = useState("");
  const [reminders, setReminders] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");
  const [showAdd, setShowAdd] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [petId, setPetId] = useState("");
  const [reminderType, setReminderType] = useState<any>("vaccination");

  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    let ownerId = "";
    const supabase = createClient();
    const load = async () => {
      if (!ownerId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.assign("/auth/login"); return; }
        ownerId = user.id;
        setUserId(user.id);
      }
      const [{ data: reminderRows }, { data: petRows }] = await Promise.all([
        supabase.from("reminders").select("*, pet:pets(name)").eq("user_id", ownerId).order("due_date"),
        supabase.from("pets").select("id, name").eq("owner_id", ownerId).order("name"),
      ]);
      if (active) {
        setReminders((reminderRows || []).map((item: any) => ({ ...item, pet_name: item.pet?.name })));
        setPets(petRows || []);
      }
    };
    void load();
    const refreshTimer = window.setInterval(() => { void load(); }, 30_000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, []);

  const handleToggle = async (id: string) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;
    const isCompleted = !reminder.is_completed;
    const { error } = await createClient().from("reminders").update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }).eq("id", id).eq("user_id", userId);
    if (error) { window.alert(error.message); return; }
    setReminders((items) => items.map((item) => item.id === id ? { ...item, is_completed: isCompleted } : item));
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !petId) return;

    const { data, error } = await createClient().from("reminders").insert({
      user_id: userId,
      pet_id: petId,
      reminder_type: reminderType,
      title,
      due_date: dueDate,
    }).select("*, pet:pets(name)").single();
    if (error || !data) { window.alert(error?.message || "تعذر إنشاء التذكير"); return; }

    setReminders((items) => [...items, { ...data, pet_name: data.pet?.name }]);
    setShowAdd(false);
    setTitle("");
    setDueDate("");
    setPetId("");
    triggerConfetti();
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === "active") return !r.is_completed;
    if (filter === "completed") return r.is_completed;
    return true;
  });

  // Export all active reminders to a combined .ics calendar file
  const handleExportAllToIcs = () => {
    const activeEvents: CalendarEvent[] = reminders
      .filter((r) => !r.is_completed)
      .map((r) => ({
        title: r.title,
        description: `تذكير رعاية طبية مسجل عبر فيت بوكس لـ ${r.pet_name || "حيوان مسجل"}. النوع: ${REMINDER_TYPE_LABELS[r.reminder_type] || r.reminder_type}`,
        startDate: r.due_date,
        petName: r.pet_name,
      }));

    if (activeEvents.length === 0) {
      alert("لا توجد مواعيد مستحقة للتصدير حالياً.");
      return;
    }

    downloadAllRemindersIcs(activeEvents, "vetbox-pet-schedule.ics");
    triggerConfetti();
  };

  const handleSingleExportIcs = (rem: any) => {
    downloadIcsFile({
      title: rem.title,
      description: `تذكير بيطري عبر فيت بوكس لـ ${rem.pet_name || "الحيوان"}.`,
      startDate: rem.due_date,
      petName: rem.pet_name,
    }, `vetbox-${rem.title}.ics`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-muted/20">
      <Header
        title="جدول المواعيد والتذكيرات الطبية"
        subtitle="متابعة جرعات التطعيم والأدوية والزيارات ومزامنتها مع تقويم الهاتف"
        role="owner"
        action={{
          label: "إضافة تذكير يدوي",
          href: "#",
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-5xl w-full">
        {/* CALENDAR SYNC BANNER (Feature Highlight) */}
        <div className="relative overflow-hidden rounded-[2rem] bg-primary text-white shadow-lg p-5 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
          <div className="pointer-events-none absolute -start-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -end-10 -bottom-24 h-60 w-60 rounded-full bg-black/10" />
          <div className="relative flex items-start gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-white/20 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Smartphone className="h-7 w-7" />
            </div>
            <div className="text-right space-y-1.5 min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2 flex-wrap">
                <span>مزامنة المواعيد مع تقويم هاتفك</span>
                <Badge variant="success" className="text-[11px] font-bold">تلقائي ومباشر</Badge>
              </h3>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                صدّر مواعيد التطعيم والجرعات إلى تقويم Apple Calendar أو Google Calendar للحصول على تنبيهات دورية على هاتفك.
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportAllToIcs}
              className="gap-2 text-xs sm:text-sm font-bold rounded-2xl bg-white text-primary border-white hover:bg-white/90 hover:text-primary w-full md:w-auto min-h-12 px-5 whitespace-normal active:scale-95 transition-transform"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>تصدير لتقويم الهاتف (Apple / iCal)</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls & Add Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-border/70 shadow-sm w-full sm:w-auto">
            <button
              onClick={() => setFilter("active")}
              className={`flex-1 sm:flex-none min-h-11 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                filter === "active" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              المستحقة ({reminders.filter((r) => !r.is_completed).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`flex-1 sm:flex-none min-h-11 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                filter === "completed" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              المكتملة ({reminders.filter((r) => r.is_completed).length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-none min-h-11 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              الكل ({reminders.length})
            </button>
          </div>

          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-2 text-sm min-h-12 px-6 rounded-2xl font-bold shadow-md w-full sm:w-auto active:scale-95 transition-transform">
            <Plus className="h-4 w-4" />
            {showAdd ? "إخفاء النموذج" : "إضافة تذكير مخصص"}
          </Button>
        </div>

        {/* Add Reminder Inline Form */}
        {showAdd && (
          <Card className="border-primary/40 bg-card p-0 gap-0 shadow-lg animate-in fade-in rounded-[2rem] overflow-hidden">
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 bg-primary/5 border-b border-border/70">
              <span className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <Plus className="h-5 w-5" />
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-foreground">إضافة تذكير طبي جديد</h3>
            </div>
            <form onSubmit={handleAddReminder} className="space-y-5 text-right p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="remPet" required>الحيوان المعني</Label>
                  <select
                    id="remPet"
                    required
                    value={petId}
                    onChange={(e) => setPetId(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-sm cursor-pointer transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- اختر الحيوان --</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remType" required>نوع التذكير</Label>
                  <select
                    id="remType"
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-input bg-muted/40 px-4 text-sm cursor-pointer transition-colors hover:border-primary/50 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {Object.entries(REMINDER_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="remTitle" required>عنوان التذكير أو الجرعة</Label>
                  <Input
                    id="remTitle"
                    required
                    placeholder="مثال: جرعة وقاية القراد، تنشيط السعار..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 rounded-2xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remDate" required>تاريخ الاستحقاق</Label>
                  <Input
                    id="remDate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-12 rounded-2xl text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="min-h-12 px-6 rounded-2xl font-semibold">
                  إلغاء
                </Button>
                <Button type="submit" size="sm" className="font-bold min-h-12 px-8 rounded-2xl shadow-md active:scale-95 transition-transform">
                  حفظ التذكير
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reminders List */}
        <div className="space-y-3 md:space-y-4">
          {filteredReminders.length === 0 ? (
            <div className="p-10 sm:p-14 text-center rounded-[2rem] border-2 border-dashed border-primary/25 bg-card">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-foreground">لا توجد مواعيد في هذا التصنيف</p>
            </div>
          ) : (
            filteredReminders.map((rem) => {
              const googleCalUrl = getGoogleCalendarUrl({
                title: rem.title,
                startDate: rem.due_date,
                petName: rem.pet_name,
                description: `تذكير رعاية طبية مسجل عبر فيت بوكس (${REMINDER_TYPE_LABELS[rem.reminder_type] || rem.reminder_type})`,
              });

              return (
                <div
                  key={rem.id}
                  className={`flex flex-col p-4 sm:p-5 rounded-3xl border border-s-[6px] transition-all gap-4 ${
                    rem.is_completed
                      ? "bg-muted/30 border-border/60 border-s-emerald-500/60 opacity-60"
                      : "bg-card border-border border-s-amber-500 hover:border-primary/40 hover:shadow-md shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={rem.is_completed}
                      onChange={() => handleToggle(rem.id)}
                      className="mt-0.5 h-6 w-6 rounded-lg border-2 border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                      id={`page-rem-${rem.id}`}
                    />
                    <div className="flex-1 min-w-0 space-y-3 text-right">
                      <div className="flex items-start justify-between gap-3">
                        <label
                          htmlFor={`page-rem-${rem.id}`}
                          className={`text-base font-extrabold cursor-pointer block leading-relaxed ${
                            rem.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {rem.title}
                        </label>
                        <div className="shrink-0">
                          {rem.is_completed ? (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                              مكتمل
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-xs">
                              <Clock className="h-3.5 w-3.5 ml-1" />
                              مستحق
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5 font-medium rounded-full bg-muted px-3 py-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          الموعد: {formatArabicDate(rem.due_date)}
                        </span>
                        {rem.pet_name && (
                          <span className="font-bold bg-primary/10 px-3 py-1 rounded-full text-primary">
                            {rem.pet_name}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[11px]">
                          {REMINDER_TYPE_LABELS[rem.reminder_type] || rem.reminder_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Direct Google Calendar Sync */}
                  {!rem.is_completed && (
                    <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
                        title="إضافة إلى تقويم Google"
                      >
                        <CalendarIcon className="h-4 w-4 text-[#4285F4]" />
                        <span>Google</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleSingleExportIcs(rem)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
                        title="تنزيل لتقويم Apple / iCal"
                      >
                        <Download className="h-4 w-4 text-emerald-600" />
                        <span>iCal</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
