"use client";

import React, { useState } from "react";
import { Pet, VaccinationRecord, MedicalVisit, PetVetLink } from "@/lib/types/database.types";
import { Check, AlertCircle, Sparkles, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WellnessGaugeProps {
  pet: Pet;
  vaccinations: VaccinationRecord[];
  visits: MedicalVisit[];
  links: PetVetLink[];
  compact?: boolean;
}

export function WellnessGauge({
  pet,
  vaccinations,
  visits,
  links,
  compact = false,
}: WellnessGaugeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Compute criteria scores
  const hasVetExam = visits.some((v) => v.author_role === "veterinarian");
  const hasVaccines = vaccinations.length > 0;
  const hasMicrochip = !!pet.microchip_number;
  const hasWeight = !!pet.weight_kg;
  const hasActiveVetLink = links.some((l) => l.status === "accepted");

  let score = 0;
  if (hasVetExam) score += 30;
  if (hasVaccines) score += 30;
  if (hasMicrochip) score += 15;
  if (hasWeight) score += 15;
  if (hasActiveVetLink) score += 10;

  // Criteria details list
  const criteria = [
    {
      label: "فحص سريري معتمد من طبيب بيطري",
      met: hasVetExam,
      points: 30,
      description: hasVetExam ? "تم تسجيل كشف دوري رسمي" : "لم يتم تسجيل كشف سريري معتمد بعد",
    },
    {
      label: "تطعيمات ولقاحات موثقة بأرقام التشغيلة",
      met: hasVaccines,
      points: 30,
      description: hasVaccines ? `${vaccinations.length} جرعات معتمدة مسجلة` : "لا توجد تطعيمات موثقة في السجل",
    },
    {
      label: "تسجيل رقم الشريحة الإلكترونية (Microchip)",
      met: hasMicrochip,
      points: 15,
      description: hasMicrochip ? `شريحة: ${pet.microchip_number}` : "غير مسجلة بعد",
    },
    {
      label: "متابعة وتوثيق الوزن بانتظام",
      met: hasWeight,
      points: 15,
      description: hasWeight ? `الوزن المسجل: ${pet.weight_kg} كجم` : "لم يسجل الوزن بعد",
    },
    {
      label: "ربط رسمي نشط مع طبيب بيطري معتمد",
      met: hasActiveVetLink,
      points: 10,
      description: hasActiveVetLink ? "صلاحية وصول طبي مفعلة" : "لا يوجد ربط نشط",
    },
  ];

  // Colors & Label based on score
  let ratingText = "رعاية نموذجية فائقة";
  let ratingColor = "text-emerald-700 dark:text-emerald-400";
  let strokeColor = "#00B664";
  let badgeVariant: "success" | "warning" | "destructive" | "neutral" = "success";

  if (score < 50) {
    ratingText = "بحاجة لفحص ورعاية عاجلة";
    ratingColor = "text-rose-600 dark:text-rose-400";
    strokeColor = "#e11d48";
    badgeVariant = "destructive";
  } else if (score < 75) {
    ratingText = "رعاية مقبولة - تحتاج متابعة";
    ratingColor = "text-amber-600 dark:text-amber-400";
    strokeColor = "#d97706";
    badgeVariant = "warning";
  } else if (score < 90) {
    ratingText = "رعاية صحية جيدة جداً";
    ratingColor = "text-emerald-600 dark:text-emerald-400";
    strokeColor = "#059669";
    badgeVariant = "success";
  }

  // SVG parameters
  const radius = compact ? 24 : 38;
  const stroke = compact ? 4 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 text-right">
        <div className="relative h-14 w-14 flex items-center justify-center shrink-0">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r={radius}
              className="stroke-muted"
              strokeWidth={stroke}
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r={radius}
              stroke={strokeColor}
              strokeWidth={stroke}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-brand font-black text-xs text-foreground">
            {score}%
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground block">مؤشر العافية</span>
          <span className={`text-xs font-bold ${ratingColor} block leading-tight`}>
            {ratingText}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4 text-right">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial SVG Gauge */}
          <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-muted"
                strokeWidth={stroke}
                fill="transparent"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke={strokeColor}
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-brand font-black text-xl text-foreground tracking-tight">
                {score}%
              </span>
              <span className="text-[9px] text-muted-foreground -mt-0.5">صحة</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5 font-display">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>مؤشر العافية والصحة الذكي (Health Score)</span>
              </h3>
              <Badge variant={badgeVariant} className="text-[10px] font-bold">
                {ratingText}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              تقييم خوارزمي دقيق لمدى اكتمال السجل الطبي والتطعيمات ومتابعة الطبيب البيطري.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-primary hover:underline font-bold inline-flex items-center gap-1 shrink-0 p-1.5 rounded-lg hover:bg-muted"
          aria-expanded={showDetails}
        >
          <span>{showDetails ? "إخفاء التفاصيل" : "عرض المعايير"}</span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expandable Criteria Checklist */}
      {showDetails && (
        <div className="pt-3 border-t border-border/70 space-y-2.5 animate-in fade-in slide-in-from-top-1 text-xs">
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                item.met
                  ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                  : "bg-muted/40 border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${
                    item.met
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {item.met ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <AlertCircle className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-foreground block">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">{item.description}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs shrink-0">
                {item.met ? `+${item.points}%` : `0%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
