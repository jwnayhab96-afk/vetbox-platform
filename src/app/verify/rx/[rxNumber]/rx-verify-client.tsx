"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatArabicDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Building2,
  Stethoscope,
  Calendar,
  Phone,
  MapPin,
  Pill,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function RxPublicVerificationClient({ rxNumber: propRxNumber }: { rxNumber?: string }) {
  const params = useParams();
  const rawRxNumber = propRxNumber || (params?.rxNumber as string);
  const rxNumber = decodeURIComponent(rawRxNumber || "");

  const [prescription, setPrescription] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    createClient().rpc("verify_prescription", { number: rxNumber })
      .then(({ data, error }) => {
        if (error) console.error("Prescription verification failed", error);
        setPrescription(data || null); setChecked(true);
      });
  }, [rxNumber]);

  const handleToggleDispensed = async () => {
    if (!prescription) return;
    const { error } = await createClient().rpc("mark_prescription_dispensed", { target_prescription_id: prescription.id });
    if (error) { window.alert("تأكيد الصرف متاح للطبيب المعالج أو إدارة المنصة فقط."); return; }
    setPrescription({ ...prescription, status: "dispensed" });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!prescription && !checked) return <div className="min-h-screen flex items-center justify-center">جارٍ التحقق من الروشتة…</div>;
  if (!prescription) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-right">
        <Card className="max-w-md w-full p-8 text-center space-y-4 rounded-3xl border-destructive/30 shadow-md bg-white">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-50 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            لم يتم التحقق من صحة الروشتة
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            الرقم التعريفي <strong className="font-mono text-slate-800">{rxNumber}</strong> غير مسجل في شبكة التحقق الرقمية لـ VetBox. قد يكون الرقم غير صحيح أو تم إلغاء الوصفة.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isDispensed = prescription.status === "dispensed";

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Verification Status Header Banner */}
        <div className="rounded-3xl bg-white border border-emerald-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                  روشتة بيطرية معتمدة رسمياً
                </h1>
                <Badge variant="success" className="text-[10px] gap-1 font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  موثقة
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                سجل إلكتروني مشفر عبر شبكة VetBox • ترخيص نقابة الأطباء البيطريين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 gap-1.5 font-semibold rounded-xl"
            >
              <Printer className="h-4 w-4 text-emerald-700" />
              طباعة الشهادة
            </Button>
            <Button
              variant={isDispensed ? "secondary" : "default"}
              size="sm"
              onClick={handleToggleDispensed}
              className="text-xs h-9 gap-1.5 font-bold rounded-xl"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isDispensed ? "تم الصرف في الصيدلية ✓" : "تأكيد صرف الروشتة"}
            </Button>
          </div>
        </div>

        {/* Official Prescription Pad Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-right">
          {/* Clinic & Rx identifier */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-700">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  {prescription.clinic_name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
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

            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-serif italic font-black text-emerald-700">℞</span>
                <span className="font-brand font-black text-lg tracking-tight text-slate-900">
                  VETBOX
                </span>
              </div>
              <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg border border-emerald-200">
                {prescription.rx_number}
              </span>
            </div>
          </div>

          {/* Patient & Doctor metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">المريض:</span>
              <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                {prescription.pet_name}
              </strong>
              <span className="text-slate-600 text-[11px]">{prescription.pet_species}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">المربي:</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {prescription.owner_name}
              </strong>
              <span className="text-slate-600 font-mono text-[11px]">{prescription.owner_phone}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">تاريخ الإصدار:</span>
              <strong className="text-slate-900 font-semibold block mt-0.5">
                {formatArabicDate(prescription.issue_date)}
              </strong>
              <span className="text-slate-500 text-[10px]">
                صالحة حتى: {formatArabicDate(prescription.valid_until)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px]">الطبيب البيطري المعتمد:</span>
              <strong className="text-emerald-900 font-bold block mt-0.5">
                {prescription.veterinarian_name}
              </strong>
              <span className="text-slate-600 font-mono text-[10px]">
                قيد النقابة: {prescription.veterinarian_license}
              </span>
            </div>
          </div>

          {/* Clinical diagnosis */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
            <span className="font-bold text-emerald-900 block mb-0.5 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-700" />
              التشخيص الطبي البيطري المعتمد:
            </span>
            <p className="text-slate-800 font-medium leading-relaxed">{prescription.diagnosis}</p>
          </div>

          {/* Prescribed Medications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="font-serif italic text-emerald-700 text-base">℞</span>
                <span>الأدوية والجرعات المقررة بالروشتة:</span>
              </h4>
              <Badge variant={isDispensed ? "neutral" : "success"} className="text-[10px]">
                {isDispensed ? "تم صرف الدواء" : "صالحة للصرف الآن"}
              </Badge>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                    <th className="p-3 w-8 text-center">#</th>
                    <th className="p-3">اسم الدواء والمادة الفعالة</th>
                    <th className="p-3">الجرعة المقررة</th>
                    <th className="p-3">التكرار</th>
                    <th className="p-3">المدة</th>
                    <th className="p-3">التعليمات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                {prescription.items.map((it: any, idx: number) => (
                    <tr key={it.id} className="hover:bg-slate-50/70">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{it.medication_name}</td>
                      <td className="p-3 font-semibold text-emerald-800">{it.dosage}</td>
                      <td className="p-3 font-medium">{it.frequency}</td>
                      <td className="p-3 font-medium">{it.duration}</td>
                      <td className="p-3 text-slate-600 text-[11px]">{it.instructions || "بحسب إرشادات العبوة"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor clinical notes */}
          {prescription.clinical_notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                توجيهات الطبيب المعالج:
              </span>
              <p className="text-amber-950 leading-relaxed font-medium">{prescription.clinical_notes}</p>
            </div>
          )}

          {/* Authentication & Verification Badge Footer */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                <QRCodeSVG value={prescription.qr_verification_code} size={70} />
              </div>
              <div className="space-y-1 text-right text-xs">
                <span className="font-bold text-emerald-800 block">
                  وثيقة رقمية معتمدة من VETBOX
                </span>
                <p className="text-[10px] text-slate-500 max-w-[220px] leading-tight">
                  تم التحقق من تطابق بيانات هذه الروشتة مع سجل الطبيب المرخص بقاعدة البيانات المركزية.
                </p>
              </div>
            </div>

            <div className="border-2 border-emerald-800 rounded-2xl p-3 px-5 text-center bg-emerald-50/40 transform rotate-[-1deg] select-none">
              <div className="text-[10px] uppercase font-bold text-emerald-900">
                ختم التوثيق الرقمي البيطري
              </div>
              <div className="text-sm font-black text-emerald-950 font-display mt-0.5">
                {prescription.veterinarian_name}
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-800 mt-0.5">
                قيد النقابة: {prescription.veterinarian_license}
              </div>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center print:hidden">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>العودة لمنصة VETBOX الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
