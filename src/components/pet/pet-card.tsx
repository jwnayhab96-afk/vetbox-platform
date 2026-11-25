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
import { Calendar, ChevronLeft, Scale, QrCode, Award } from "lucide-react";

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
        <Card className="overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 group bg-card rounded-3xl shadow-xs hover:shadow-md flex flex-col justify-between h-full">
          <div>
            <div className="relative h-48 sm:h-52 w-full bg-muted/60 overflow-hidden">
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
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-md shadow-xs">
                  <SpeciesIcon species={pet.species} className="h-3.5 w-3.5 text-primary" />
                  {speciesMeta.ar}
                </span>
              </div>
              <div className="absolute top-3 left-3">
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-black/75 hover:bg-primary text-white px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                  title="تحميل كارت الهوية"
                >
                  <QrCode className="h-3 w-3 text-emerald-400" />
                  <span>PASS-{pet.id.substring(0, 6).toUpperCase()}</span>
                </button>
              </div>
            </div>

            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors font-display">
                      {pet.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{pet.breed || "فصيلة مختلطة"}</p>
                  </div>
                  <HealthIndicator
                    hasRecentExam={hasRecentExam}
                    hasOverdueVaccine={false}
                    isOwnerReportedOnly={!hasRecentExam}
                  />
                </div>
              </div>

              {/* Vital stats row */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>العمر: <strong className="text-foreground font-semibold">{ageDisplay}</strong></span>
                </div>
                {pet.weight_kg ? (
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>الوزن: <strong className="text-foreground font-semibold">{pet.weight_kg} كجم</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <span>الوزن غير مسجل</span>
                  </div>
                )}
              </div>

              {/* Microchip tag */}
              {pet.microchip_number && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-xl font-mono">
                  <QrCode className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">الشريحة: {pet.microchip_number}</span>
                </div>
              )}

              {/* Next reminder if available */}
              {nextReminder && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs text-amber-950">
                  <span className="font-bold block mb-0.5">التذكير القادم:</span>
                  <span className="truncate block">{nextReminder.title} ({nextReminder.due_date})</span>
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-5 pt-0 flex items-center gap-2">
            <Link href={`/owner/pets/detail?id=${encodeURIComponent(pet.id)}`} className="flex-1">
              <Button
                variant="default"
                className="w-full text-xs font-bold justify-between bg-primary hover:bg-primary-hover text-white shadow-xs rounded-xl transition-all"
              >
                <span>فتح بطاقة الهوية والملف</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowIdCard(true)}
              className="rounded-xl border-border hover:border-primary shrink-0"
              title="تحميل كارت الهوية والـ QR"
              aria-label="تحميل كارت الهوية"
            >
              <QrCode className="h-4 w-4 text-primary" />
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
