"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pet, Reminder } from "@/lib/types/database.types";
import { calculateAge, SPECIES_LABELS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeciesIcon } from "@/components/pet/species-icon";
import { HealthIndicator } from "@/components/pet/health-indicator";
import { ScaleOnHover } from "@/components/ui/motion";
import { PetIdCardModal } from "@/components/pet/pet-id-card-modal";
import { Calendar, ChevronLeft, Scale, QrCode } from "lucide-react";

interface PetCardProps {
  pet: Pet;
  nextReminder?: Reminder;
  hasRecentExam?: boolean;
}

export function PetCard({ pet, nextReminder, hasRecentExam = false }: PetCardProps) {
  const [showIdCard, setShowIdCard] = useState(false);
  const speciesMeta = SPECIES_LABELS[pet.species] || { ar: pet.species, icon: "Sparkles" };
  const ageDisplay = calculateAge(pet.birth_date, pet.estimated_age_months);

  return (
    <>
      <ScaleOnHover scale={1.02} className="h-full">
        <Card className="overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 group bg-card rounded-3xl shadow-sm hover:shadow-md flex flex-col justify-between h-full text-right">
          <div>
            <div className="relative h-44 sm:h-52 w-full bg-muted/60 overflow-hidden">
              {pet.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                  <SpeciesIcon species={pet.species} className="h-16 w-16 opacity-40 group-hover:scale-110 transition-transform duration-300" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />
              <div className="absolute top-3 start-3 max-w-[55%]">
                <span className="inline-flex items-center gap-1.5 min-h-9 px-3.5 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-md shadow-sm max-w-full">
                  <SpeciesIcon species={pet.species} className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{speciesMeta.ar}</span>
                </span>
              </div>
              <div className="absolute top-3 end-3">
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="inline-flex items-center gap-1.5 min-h-10 text-[11px] font-mono font-bold bg-black/75 hover:bg-primary text-white px-3 rounded-xl backdrop-blur-xs transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  title="تحميل كارت الهوية"
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>PASS-{pet.id.substring(0, 6).toUpperCase()}</span>
                </button>
              </div>
            </div>

            <CardContent className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors font-display leading-snug truncate">
                    {pet.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{pet.breed || "فصيلة مختلطة"}</p>
                </div>
                <div className="shrink-0">
                  <HealthIndicator
                    hasRecentExam={hasRecentExam}
                    hasOverdueVaccine={false}
                    isOwnerReportedOnly={!hasRecentExam}
                  />
                </div>
              </div>

              {/* Vital stats row */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-2.5 min-w-0">
                  <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 leading-snug">العمر: <strong className="text-foreground font-bold block sm:inline">{ageDisplay}</strong></span>
                </div>
                {pet.weight_kg ? (
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-2.5 min-w-0">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Scale className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 leading-snug">الوزن: <strong className="text-foreground font-bold block sm:inline">{pet.weight_kg} كجم</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-muted/30 p-2.5 min-w-0">
                    <span className="h-8 w-8 rounded-lg bg-muted text-muted-foreground/60 flex items-center justify-center shrink-0">
                      <Scale className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 leading-snug">الوزن غير مسجل</span>
                  </div>
                )}
              </div>

              {/* Microchip tag */}
              {pet.microchip_number && (
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl font-mono">
                  <QrCode className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">الشريحة: {pet.microchip_number}</span>
                </div>
              )}

              {/* Next reminder if available */}
              {nextReminder && (
                <div className="bg-amber-50 border border-amber-300/60 border-s-4 border-s-amber-500 p-3 rounded-xl text-xs sm:text-sm text-amber-950">
                  <span className="font-extrabold block mb-0.5">التذكير القادم:</span>
                  <span className="truncate block text-amber-900/90">{nextReminder.title} ({nextReminder.due_date})</span>
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
            <Link
              href={`/owner/pets/detail?id=${encodeURIComponent(pet.id)}`}
              className="flex-1 min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              <Button
                variant="default"
                className="w-full min-h-12 text-xs sm:text-sm font-bold justify-between bg-primary hover:bg-primary-hover text-white shadow-sm rounded-xl transition-all active:scale-[0.97]"
              >
                <span className="truncate">فتح بطاقة الهوية والملف</span>
                <ChevronLeft className="h-4 w-4 shrink-0" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowIdCard(true)}
              className="h-12 w-12 min-h-12 rounded-xl border-border bg-card hover:border-primary hover:bg-primary/5 shrink-0 transition-all active:scale-95"
              title="تحميل كارت الهوية والـ QR"
              aria-label="تحميل كارت الهوية"
            >
              <QrCode className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </Card>
      </ScaleOnHover>

      <PetIdCardModal
        isOpen={showIdCard}
        onClose={() => setShowIdCard(false)}
        pet={pet}
      />
    </>
  );
}
