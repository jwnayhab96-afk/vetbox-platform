"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Prescription } from "@/lib/types/database.types";
import { formatArabicDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  X,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
  Building2,
  Phone,
  MapPin,
  Pill,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface PrescriptionModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleDispensed?: (id: string) => void;
}

export function PrescriptionModal({
  prescription,
  isOpen,
  onClose,
  onToggleDispensed,
}: PrescriptionModalProps) {
  const [copied, setCopied] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const medList = prescription.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.medication_name} - الجرعة: ${it.dosage} (${it.frequency}) لمدة ${it.duration}`
      )
      .join("\n");

    const message = `📋 *روشتة علاجية بيطرية معتمدة من VETBOX*
🐾 المريض: ${prescription.pet_name} (${prescription.pet_species})
👤 المربي: ${prescription.owner_name}
🩺 الطبيب المعالج: ${prescription.veterinarian_name} (ترخيص: ${prescription.veterinarian_license})
🏥 العيادة: ${prescription.clinic_name}
🔢 رقم الروشتة: ${prescription.rx_number}
📅 تاريخ الإصدار: ${formatArabicDate(prescription.issue_date)}

💊 *قائمة الأدوية المقررة:*
${medList}

🔍 *رابط التحقق الرقمي الرسمي:*
${prescription.qr_verification_code}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(prescription.qr_verification_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-auto bg-background rounded-3xl shadow-2xl border border-border overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span>الروشتة الطبية الإلكترونية المعتمدة</span>
            </span>
            <Badge
              variant={prescription.status === "active" ? "success" : "neutral"}
              className="text-[11px] font-bold"
            >
              {prescription.status === "active" ? "صالحة للصرف" : "تم الصرف في الصيدلية"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {onToggleDispensed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleDispensed(prescription.id)}
                className="text-xs h-8 rounded-lg gap-1 border-border font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {prescription.status === "active" ? "تحديد كـ تم الصرف" : "إعادة كـ نشطة"}
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="text-xs h-8 rounded-lg gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 font-semibold"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">إرسال للصيدلية</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 rounded-lg gap-1.5 bg-primary hover:bg-primary-hover text-white font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة الروشتة</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RX PAD CONTAINER */}
        <div
          ref={printAreaRef}
          className="p-6 sm:p-10 space-y-6 bg-white text-slate-900 print:p-0 print:m-0"
          id="printable-rx"
        >
          {/* Header of Prescription */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-700/80">
            {/* Clinic Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  {prescription.clinic_name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                {prescription.clinic_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-700" />
                    {prescription.clinic_address}
                  </span>
                )}
                {prescription.clinic_phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-emerald-700" />
                    {prescription.clinic_phone}
                  </span>
                )}
              </div>
            </div>

            {/* Brand Logo & Rx Identifier */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif italic font-black text-emerald-700 tracking-wider">
                  ℞
                </span>
                <span className="font-brand font-black text-lg tracking-tight text-slate-900">
                  VETBOX
                </span>
              </div>
              <div className="text-left font-mono text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-sans">
                  Official Rx No.
                </span>
                <strong className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 block">
                  {prescription.rx_number}
                </strong>
              </div>
            </div>
          </div>

          {/* Patient & Owner Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">المريض (الحيوان):</span>
              <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                {prescription.pet_name}
              </strong>
              <span className="text-slate-600 text-[11px]">
                {prescription.pet_species}
                {prescription.pet_breed ? ` • ${prescription.pet_breed}` : ""}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">المربي (المالك):</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {prescription.owner_name}
              </strong>
              <span className="text-slate-600 font-mono text-[11px]">
                {prescription.owner_phone}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">تاريخ الكشف والإصدار:</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {formatArabicDate(prescription.issue_date)}
              </strong>
              <span className="text-slate-500 text-[10px]">
                صالحة حتى: {formatArabicDate(prescription.valid_until)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">الطبيب المعالج:</span>
              <strong className="text-emerald-900 font-bold block mt-0.5">
                {prescription.veterinarian_name}
              </strong>
              <span className="text-slate-600 font-mono text-[10px]">
                ترخيص: {prescription.veterinarian_license}
              </span>
            </div>
          </div>

          {/* Diagnosis strip */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
            <span className="font-bold text-emerald-900 block mb-0.5 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-700" />
              التشخيص الطبي السريري المعتمد:
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {prescription.diagnosis}
            </p>
          </div>

          {/* Prescribed Items (The Core Rx) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="text-lg font-serif italic text-emerald-700">℞</span>
                <span>قائمة الأدوية والجرعات المقررة:</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {prescription.items.length} أصناف دوائية
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                    <th className="p-3 w-8 text-center">#</th>
                    <th className="p-3">اسم الدواء والمادة الفعالة</th>
                    <th className="p-3">الجرعة المقررة</th>
                    <th className="p-3">معدل التكرار</th>
                    <th className="p-3">مدة الاستخدام</th>
                    <th className="p-3">إرشادات وتحذيرات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {prescription.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {item.medication_name}
                      </td>
                      <td className="p-3 font-semibold text-emerald-800">
                        {item.dosage}
                      </td>
                      <td className="p-3 font-medium">
                        {item.frequency}
                      </td>
                      <td className="p-3 font-medium">
                        {item.duration}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">
                        {item.instructions || "بحسب إرشادات العبوة"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Instructions & Notes */}
          {prescription.clinical_notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                توصيات وملاحظات الطبيب البيطري للمربي:
              </span>
              <p className="text-amber-950 leading-relaxed font-medium">
                {prescription.clinical_notes}
              </p>
            </div>
          )}

          {/* Verification & Official Doctor Stamp Section */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Scannable QR Code */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                <QRCodeSVG
                  value={prescription.qr_verification_code}
                  size={76}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  رمز التحقق الرقمي المشفر
                </span>
                <p className="text-[10px] text-slate-500 max-w-[200px] leading-tight">
                  امسح الرمز بكاميرا الهاتف للتحقق الفوري من صحة الروشتة واعتماد الطبيب المعالج عبر شبكة VetBox.
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold block print:hidden"
                >
                  {copied ? "تم نسخ الرابط بنجاح ✓" : "نسخ رابط التحقق"}
                </button>
              </div>
            </div>

            {/* Official Doctor's Digital Seal / Stamp */}
            <div className="flex items-center justify-center">
              <div className="relative border-2 border-emerald-800/80 rounded-2xl p-3 px-5 text-center bg-emerald-50/30 transform rotate-[-2deg] shadow-xs select-none">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-900">
                  ختم الطبيب البيطري المعتمد
                </div>
                <div className="text-sm font-black text-emerald-950 font-display mt-0.5">
                  {prescription.veterinarian_name}
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-800 mt-0.5">
                  قيد النقابة: {prescription.veterinarian_license}
                </div>
                <div className="text-[9px] text-emerald-700/80 mt-0.5">
                  VERIFIED BY VETBOX DIGITAL RX
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legal & Anti-Counterfeit notice */}
          <div className="pt-2 text-center text-[10px] text-slate-600 flex items-center justify-center gap-2">
            <span>منظومة الروشتة البيطرية الموحدة — VETBOX EGYPT</span>
            <span>•</span>
            <span>وثيقة طبية رسمية مشفرة رقمياً وغير قابلة للتعديل بعد الصرف</span>
          </div>
        </div>
      </div>
    </div>
  );
}
