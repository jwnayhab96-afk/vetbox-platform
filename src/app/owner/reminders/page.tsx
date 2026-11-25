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
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign("/auth/login"); return; }
      setUserId(user.id);
      const [{ data: reminderRows }, { data: petRows }] = await Promise.all([
        supabase.from("reminders").select("*, pet:pets(name)").eq("user_id", user.id).order("due_date"),
        supabase.from("pets").select("id, name").eq("owner_id", user.id).order("name"),
      ]);
      setReminders((reminderRows || []).map((item: any) => ({ ...item, pet_name: item.pet?.name })));
      setPets(petRows || []);
    };
    load();
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
    <div className="flex-1 flex flex-col min-h-screen">
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

      <div className="p-4 md:p-8 space-y-6 max-w-5xl">
        {/* CALENDAR SYNC BANNER (Feature Highlight) */}
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="text-right space-y-0.5">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <span>مزامنة المواعيد مع تقويم هاتفك</span>
                <Badge variant="success" className="text-[10px] font-bold">تلقائي ومباشر</Badge>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                صدّر مواعيد التطعيم والجرعات إلى تقويم Apple Calendar أو Google Calendar للحصول على تنبيهات دورية على هاتفك.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportAllToIcs}
              className="gap-2 text-xs font-bold rounded-xl border-border hover:border-primary w-full md:w-auto h-10"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>تصدير لتقويم الهاتف (Apple / iCal)</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls & Add Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filter === "active" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              المستحقة ({reminders.filter((r) => !r.is_completed).length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filter === "completed" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              المكتملة ({reminders.filter((r) => r.is_completed).length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              الكل ({reminders.length})
            </button>
          </div>

          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1.5 text-xs h-10 rounded-xl font-bold">
            <Plus className="h-4 w-4" />
            {showAdd ? "إخفاء النموذج" : "إضافة تذكير مخصص"}
          </Button>
        </div>

        {/* Add Reminder Inline Form */}
        {showAdd && (
          <Card className="border-primary/40 bg-card p-6 shadow-md animate-in fade-in space-y-4 rounded-3xl">
            <h3 className="font-bold text-base text-foreground">إضافة تذكير طبي جديد</h3>
            <form onSubmit={handleAddReminder} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remPet" required>الحيوان المعني</Label>
                  <select
                    id="remPet"
                    required
                    value={petId}
                    onChange={(e) => setPetId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- اختر الحيوان --</option>
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="remType" required>نوع التذكير</Label>
                  <select
                    id="remType"
                    value={reminderType}
                    onChange={(e) => setReminderType(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {Object.entries(REMINDER_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remTitle" required>عنوان التذكير أو الجرعة</Label>
                  <Input
                    id="remTitle"
                    required
                    placeholder="مثال: جرعة وقاية القراد، تنشيط السعار..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="remDate" required>تاريخ الاستحقاق</Label>
                  <Input
                    id="remDate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  حفظ التذكير
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reminders List */}
        <div className="space-y-3">
          {filteredReminders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/60">
              <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">لا توجد مواعيد في هذا التصنيف</p>
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
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                    rem.is_completed
                      ? "bg-muted/30 border-border/60 opacity-60"
                      : "bg-card border-border hover:border-primary/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={rem.is_completed}
                      onChange={() => handleToggle(rem.id)}
                      className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                      id={`page-rem-${rem.id}`}
                    />
                    <div className="space-y-1 text-right">
                      <label
                        htmlFor={`page-rem-${rem.id}`}
                        className={`text-sm font-bold cursor-pointer block ${
                          rem.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {rem.title}
                      </label>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          الموعد: {formatArabicDate(rem.due_date)}
                        </span>
                        {rem.pet_name && (
                          <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded-md text-primary">
                            {rem.pet_name}
                          </span>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {REMINDER_TYPE_LABELS[rem.reminder_type] || rem.reminder_type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Direct Google Calendar Sync */}
                    {!rem.is_completed && (
                      <>
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          title="إضافة إلى تقويم Google"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 text-[#4285F4]" />
                          <span className="hidden md:inline">Google</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleSingleExportIcs(rem)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          title="تنزيل لتقويم Apple / iCal"
                        >
                          <Download className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="hidden md:inline">iCal</span>
                        </button>
                      </>
                    )}

                    <div>
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
