"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Pet, Profile } from "@/lib/types/database.types";
import { calculateAge, SPECIES_LABELS } from "@/lib/utils";
import { SpeciesIcon } from "@/components/pet/species-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Download,
  Printer,
  QrCode,
  Share2,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  Calendar,
  Scale,
  Check,
  Copy,
} from "lucide-react";
import { triggerConfetti } from "@/components/ui/motion";

interface PetIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  owner?: Partial<Profile> | null;
}

export function PetIdCardModal({
  isOpen,
  onClose,
  pet,
  owner,
}: PetIdCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const speciesMeta = SPECIES_LABELS[pet.species] || { ar: pet.species, icon: "Sparkles" };
  const ageDisplay = calculateAge(pet.birth_date, pet.estimated_age_months);
  
  // URL that the QR code encodes (points to the live pet verification or profile)
  const currentOrigin = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const profileUrl = `${currentOrigin}/verify/pet-check?petId=${encodeURIComponent(pet.id)}`;

  const ownerName = owner?.full_name || "غير مسجل";
  const ownerPhone = owner?.phone || "غير مسجل";

  // Canvas drawing and download function
  const handleDownloadImage = async () => {
    try {
      setDownloading(true);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Card dimensions: 1000 x 625 (1.6 aspect ratio - standard ID card)
      canvas.width = 1000;
      canvas.height = 625;

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 1000, 625);
      bgGradient.addColorStop(0, "#064e3b"); // Deep forest teal
      bgGradient.addColorStop(0.5, "#065f46");
      bgGradient.addColorStop(1, "#022c22");
      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, 1000, 625, 36);
      ctx.fill();

      // Holographic / subtle gold border
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 182, 100, 0.4)";
      ctx.stroke();

      // Top Header Ribbon
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(20, 20, 960, 90, 20);
      ctx.fill();

      // VETBOX Logo Text (Left side)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px 'Outfit', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("VET", 50, 75);
      ctx.fillStyle = "#00b664";
      ctx.fillText("BOX", 116, 75);

      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = "600 13px sans-serif";
      ctx.fillText("SMART MEDICAL PET ID", 50, 95);

      // Card Title (Right side in Arabic)
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.font = "bold 24px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText("بطاقة الهوية الطبية المعتمدة", 950, 65);
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 15px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText(`كود الهوية: PASS-${pet.id.substring(0, 8).toUpperCase()}`, 950, 92);

      // White inner card surface for high contrast & readability
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(30, 130, 940, 420, 24);
      ctx.fill();

      // Inner subtle border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();

      // Draw Pet Photo (or placeholder box)
      const photoX = 740;
      const photoY = 160;
      const photoW = 200;
      const photoH = 240;

      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 18);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#00b664";
      ctx.stroke();

      // If pet has photo, try to load and draw it
      if (pet.photo_url) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = pet.photo_url;
          await new Promise((res) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(photoX, photoY, photoW, photoH, 18);
              ctx.clip();
              ctx.drawImage(img, photoX, photoY, photoW, photoH);
              ctx.restore();
              res(true);
            };
            img.onerror = () => res(false);
          });
        } catch (e) {
          // Fallback if image fails to load
        }
      }

      // Pet Name & Details (Middle-Right)
      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 36px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText(pet.name, 710, 205);

      ctx.fillStyle = "#059669";
      ctx.font = "bold 18px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText(`${speciesMeta.ar} • ${pet.breed || "فصيلة مختلطة"}`, 710, 240);

      // Meta grid
      ctx.fillStyle = "#475569";
      ctx.font = "16px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText(`العمر: ${ageDisplay}`, 710, 280);
      ctx.fillText(`الوزن: ${pet.weight_kg ? pet.weight_kg + " كجم" : "غير محدد"}`, 710, 312);
      ctx.fillText(`الجنس: ${pet.gender === "male" ? "ذكر" : "أنثى"}${pet.is_spayed_neutered ? " (معقم)" : ""}`, 710, 344);

      if (pet.microchip_number) {
        ctx.fillStyle = "#007743";
        ctx.font = "bold 15px monospace";
        ctx.fillText(`الشريحة: ${pet.microchip_number}`, 710, 380);
      }

      // Divider line
      ctx.beginPath();
      ctx.moveTo(320, 160);
      ctx.lineTo(320, 520);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Owner & Emergency Contact Section (Middle-Left)
      ctx.fillStyle = "#045e36";
      ctx.font = "bold 20px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText("بيانات المربي ورقم الطوارئ", 680, 440);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 18px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText(`المالك: ${ownerName}`, 680, 475);

      ctx.fillStyle = "#b91c1c"; // Red / emergency phone
      ctx.font = "bold 22px monospace";
      ctx.fillText(`هاتف الطوارئ: ${ownerPhone}`, 680, 510);

      // QR Code Rendering on Left side
      const svg = cardRef.current?.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const qrImg = new Image();
        await new Promise((res) => {
          qrImg.onload = () => {
            ctx.drawImage(qrImg, 80, 180, 200, 200);
            URL.revokeObjectURL(blobURL);
            res(true);
          };
          qrImg.src = blobURL;
        });

        ctx.textAlign = "center";
        ctx.fillStyle = "#475569";
        ctx.font = "bold 14px 'IBM Plex Sans Arabic', sans-serif";
        ctx.fillText("امسح الـ QR للوصول للملف", 180, 415);
        ctx.fillText("وسجل الطوارئ الكامل", 180, 435);
      }

      // Bottom Card Security Footer
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      ctx.font = "bold 14px 'IBM Plex Sans Arabic', sans-serif";
      ctx.fillText("منظومة فيت بوكس للرعاية البيطرية المعتمدة • جمهورية مصر العربية • VETBOX.EG", 500, 590);

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `VETBOX-ID-CARD-${pet.name}.png`;
      link.href = dataUrl;
      link.click();

      triggerConfetti();
    } catch (err) {
      console.error("Failed to export card:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-4 sm:p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
        <DialogHeader className="text-right pb-3 border-b border-border/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <QrCode className="h-5 w-5" />
              <DialogTitle className="text-xl">كارت الهوية البيطرية الذكي (Smart ID Card)</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            بطاقة تعريف رسمية خاصة بحيوانك تتضمن بياناته وصورته ورقم هاتف المربي مع رمز QR للوصول الفوري للملف الطبي وسجل الطوارئ.
          </DialogDescription>
        </DialogHeader>

        {/* VISUAL CARD PREVIEW (High Fidelity Smart Card) */}
        <div className="py-2 flex justify-center">
          <div
            ref={cardRef}
            className="w-full max-w-lg rounded-3xl overflow-hidden border-2 border-primary/40 shadow-xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white relative p-5 space-y-4"
          >
            {/* Ambient Sheen */}
            <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

            {/* Top Bar of the Card */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 relative z-10">
              {/* Logo English */}
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/vetbox-logo.png" alt="" className="h-8 w-auto object-contain" />
                <div className="flex flex-col text-left leading-none">
                  <span className="font-brand font-black text-white text-lg tracking-tight uppercase">
                    VET<span className="text-emerald-400">BOX</span>
                  </span>
                  <span className="text-[8px] font-brand font-bold tracking-[0.16em] text-emerald-200/80">
                    SMART PET ID
                  </span>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="text-right">
                <span className="text-xs font-black block text-white">بطاقة الهوية الطبية</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ID: PASS-{pet.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Inner Content Card (White Surface) */}
            <div className="bg-card text-foreground rounded-2xl p-4 sm:p-5 shadow-md border border-border/80 grid grid-cols-12 gap-4 items-center relative z-10 text-right">
              {/* Left Column: QR Code */}
              <div className="col-span-4 sm:col-span-4 flex flex-col items-center justify-center p-2 rounded-xl bg-muted/40 border border-border/60 text-center">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-border">
                  <QRCodeSVG
                    value={profileUrl}
                    size={90}
                    level="H"
                    includeMargin={false}
                    fgColor="#064e3b"
                  />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-2 leading-tight">
                  امسح الـ QR
                  <br />
                  للملف وسجل الطوارئ
                </span>
              </div>

              {/* Right Column: Pet Info & Owner Contact */}
              <div className="col-span-8 sm:col-span-8 space-y-2.5">
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/30 shrink-0 shadow-xs relative">
                    {pet.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <SpeciesIcon species={pet.species} className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Name and Species */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-black text-foreground truncate">{pet.name}</h3>
                    <p className="text-xs text-primary font-bold">
                      {speciesMeta.ar} • {pet.breed || "سلالة مختلطة"}
                    </p>
                    <div className="text-[11px] text-muted-foreground space-y-0.5 mt-1">
                      <div>العمر: <strong>{ageDisplay}</strong></div>
                      {pet.weight_kg && <div>الوزن: <strong>{pet.weight_kg} كجم</strong></div>}
                    </div>
                  </div>
                </div>

                {/* Microchip Tag */}
                {pet.microchip_number && (
                  <div className="text-[10px] font-mono bg-muted p-1.5 rounded-lg text-primary font-bold truncate">
                    شريحة: {pet.microchip_number}
                  </div>
                )}

                {/* Owner & Emergency Contact Section */}
                <div className="pt-2 border-t border-border/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <User className="h-3 w-3 text-primary" />
                      المالك: {ownerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-xl text-emerald-950 font-bold">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      طوارئ:
                    </span>
                    <a href={`tel:${ownerPhone}`} className="font-mono text-xs text-emerald-700 hover:underline">
                      {ownerPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Security Footer */}
            <div className="text-center text-[10px] text-emerald-200/80 font-medium flex items-center justify-center gap-1.5 relative z-10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>معتمد من منصة فيت بوكس • VETBOX VERIFIED HEALTH IDENTITY</span>
            </div>
          </div>
        </div>

        {/* ACTIONS STRIP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/70">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "تم نسخ الرابط!" : "نسخ رابط الملف"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              <Printer className="h-4 w-4 text-foreground" />
              <span>طباعة</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="default"
            size="default"
            onClick={handleDownloadImage}
            isLoading={downloading}
            className="gap-2 font-bold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>تحميل كارت الهوية (PNG عالية الدقة)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
