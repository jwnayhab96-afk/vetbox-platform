import React from "react";
import { MedicalVisit } from "@/lib/types/database.types";
import { formatArabicDate, VISIT_TYPE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  ShieldCheck,
  User,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Clock,
  Building,
} from "lucide-react";

interface TimelineItemProps {
  visit: MedicalVisit;
}

export function TimelineItem({ visit }: TimelineItemProps) {
  const isVet = visit.author_role === "veterinarian";

  return (
    <div className="relative pr-8 pb-8 last:pb-2">
      {/* Timeline line */}
      <div className="absolute right-3.5 top-3 bottom-0 w-0.5 bg-border/80" />

      {/* Timeline node icon */}
      <div
        className={`absolute right-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background shadow-xs ${
          isVet ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {isVet ? <Stethoscope className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
      </div>

      {/* Card Content */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-6 shadow-xs space-y-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base md:text-lg text-foreground">
                {visit.visit_reason}
              </span>
              <Badge variant="outline" className="text-xs">
                {VISIT_TYPE_LABELS[visit.visit_type] || visit.visit_type}
              </Badge>
              {isVet ? (
                <Badge variant="success" className="text-xs">
                  <ShieldCheck className="h-3 w-3 ml-1 text-emerald-600" />
                  كشف بيطري معتمد
                </Badge>
              ) : (
                <Badge variant="neutral" className="text-xs">
                  ملاحظة مسجلة من المربي
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {formatArabicDate(visit.visit_date)}
              </span>
              {visit.clinic && (
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  {visit.clinic.name_ar || visit.clinic.name}
                </span>
              )}
              {visit.vet?.profile && (
                <span className="flex items-center gap-1 font-medium text-foreground">
                  الطبيب: {visit.vet.profile.full_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Complaints and Findings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {visit.presenting_complaints && (
            <div className="space-y-1 bg-muted/30 p-3 rounded-xl border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground block">الأعراض والشكوى:</span>
              <p className="text-foreground leading-relaxed">{visit.presenting_complaints}</p>
            </div>
          )}

          {visit.clinical_examination && (
            <div className="space-y-1 bg-muted/30 p-3 rounded-xl border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground block">نتائج الفحص الإكلينيكي:</span>
              <p className="text-foreground leading-relaxed">{visit.clinical_examination}</p>
            </div>
          )}
        </div>

        {/* Diagnosis & Treatment */}
        {(visit.diagnosis || visit.treatment_plan) && (
          <div className="space-y-3 pt-2">
            {visit.diagnosis && (
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                <span className="text-xs font-semibold text-primary block mb-1">
                  {isVet ? "التشخيص الطبي البيطري:" : "ملاحظة أو تقرير مبدئي:"}
                </span>
                <p className="text-sm font-medium text-foreground">{visit.diagnosis}</p>
              </div>
            )}

            {visit.treatment_plan && (
              <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20">
                <span className="text-xs font-semibold text-secondary block mb-1">الخطة العلاجية والتوصيات:</span>
                <p className="text-sm text-foreground leading-relaxed">{visit.treatment_plan}</p>
              </div>
            )}
          </div>
        )}

        {/* Vitals row */}
        {(visit.temperature_celsius || visit.heart_rate_bpm || visit.respiratory_rate_bpm) && (
          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground flex-wrap border-t border-border/60">
            <span className="font-semibold text-foreground">المؤشرات الحيوية:</span>
            {visit.temperature_celsius && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <Thermometer className="h-3.5 w-3.5 text-amber-600" />
                الحرارة: {visit.temperature_celsius} °C
              </span>
            )}
            {visit.heart_rate_bpm && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                النبض: {visit.heart_rate_bpm} نبضة/د
              </span>
            )}
            {visit.respiratory_rate_bpm && (
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <Activity className="h-3.5 w-3.5 text-sky-600" />
                التنفس: {visit.respiratory_rate_bpm} د/د
              </span>
            )}
          </div>
        )}

        {/* Next appointment */}
        {visit.next_appointment_date && (
          <div className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>الموعد القادم الموصى به: {formatArabicDate(visit.next_appointment_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
