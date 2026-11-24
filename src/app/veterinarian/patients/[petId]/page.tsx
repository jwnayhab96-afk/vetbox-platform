"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/shared/header";
import { TimelineItem } from "@/components/medical/timeline-item";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/data/store";
import { calculateAge, formatArabicDate, SPECIES_LABELS } from "@/lib/utils";
import { PrescriptionModal } from "@/components/medical/prescription-modal";
import { Prescription, PrescriptionItem } from "@/lib/types/database.types";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  Plus,
  ShieldCheck,
  Calendar,
  Scale,
  QrCode,
  Syringe,
  Pill,
  Clock,
  ArrowRight,
  AlertCircle,
  Printer,
  Trash2,
} from "lucide-react";

export default function VetPatientDetailPage() {
  const params = useParams();
  const petId = params.id as string || (params.petId as string);
  const vetId = "33333333-3333-3333-3333-333333333333";

  const pet = store.getPetById(petId);
  const [visits, setVisits] = useState(() => store.getVisitsByPet(petId));
  const [vaccinations, setVaccinations] = useState(() => store.getVaccinationsByPet(petId));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => store.getPrescriptionsByPet(petId));

  // Quick vaccine recording modal
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vacName, setVacName] = useState("");
  const [vacTarget, setVacTarget] = useState("");
  const [vacDate, setVacDate] = useState(new Date().toISOString().split("T")[0]);
  const [vacNextDate, setVacNextDate] = useState("");
  const [vacBatch, setVacBatch] = useState("");
  const [vacManufacturer, setVacManufacturer] = useState("");
  const [vacSaving, setVacSaving] = useState(false);

  // E-Prescription modal states
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [showCreateRxModal, setShowCreateRxModal] = useState(false);
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxNotes, setRxNotes] = useState("");
  const [rxItems, setRxItems] = useState<Array<{ medication_name: string; dosage: string; frequency: string; duration: string; instructions: string }>>([
    { medication_name: "", dosage: "", frequency: "كل 12 ساعة", duration: "7 أيام", instructions: "" }
  ]);
  const [rxSaving, setRxSaving] = useState(false);

  if (!pet) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-xl font-bold">ملف المريض غير موجود</h2>
        <Link href="/veterinarian/patients" className="mt-4">
          <Button variant="outline">العودة لقائمة المرضى</Button>
        </Link>
      </div>
    );
  }

  const speciesMeta = SPECIES_LABELS[pet.species] || { ar: pet.species, icon: "Sparkles" };
  const ageDisplay = calculateAge(pet.birth_date, pet.estimated_age_months);

  const handleSaveVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName || !vacDate) return;

    setVacSaving(true);
    store.addVaccinationRecord({
      pet_id: pet.id,
      administered_by_vet_id: vetId,
      created_by: vetId,
      vaccine_name: vacName,
      target_diseases: vacTarget || "وقاية عامة",
      administration_date: vacDate,
      next_due_date: vacNextDate || null,
      batch_number: vacBatch || null,
      manufacturer: vacManufacturer || null,
      is_verified_by_vet: true,
      notes: "تم الإعطاء في العيادة بواسطة الطبيب المعالج.",
    });

    setTimeout(() => {
      setVaccinations(store.getVaccinationsByPet(pet.id));
      setVacSaving(false);
      setShowVaccineModal(false);
      setVacName("");
      setVacTarget("");
      setVacBatch("");
    }, 400);
  };

  const handleAddRxItem = () => {
    setRxItems([
      ...rxItems,
      { medication_name: "", dosage: "", frequency: "مرة واحدة يومياً", duration: "5 أيام", instructions: "" }
    ]);
  };

  const handleRemoveRxItem = (index: number) => {
    if (rxItems.length <= 1) return;
    setRxItems(rxItems.filter((_, i) => i !== index));
  };

  const handleUpdateRxItem = (index: number, field: string, val: string) => {
    const updated = [...rxItems];
    (updated[index] as any)[field] = val;
    setRxItems(updated);
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxDiagnosis) return;
    const validItems = rxItems.filter((it) => it.medication_name.trim() !== "");
    if (validItems.length === 0) {
      alert("يرجى إضافة دواء واحد على الأقل للروشتة");
      return;
    }

    setRxSaving(true);
    const owner = store.getUsers().find((u) => u.id === pet.owner_id);
    const newRx = store.addPrescription({
      pet_id: pet.id,
      pet_name: pet.name,
      pet_species: speciesMeta.ar,
      pet_breed: pet.breed || null,
      owner_id: pet.owner_id,
      owner_name: owner?.full_name || "مربي الحيوان",
      owner_phone: owner?.phone || "01012345678",
      veterinarian_id: vetId,
      veterinarian_name: "د. يوسف الشناوي",
      veterinarian_license: "EGY-VET-48920",
      clinic_name: "مستشفى النيل البيطري التخصصي",
      clinic_phone: "0227508900",
      clinic_address: "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
      diagnosis: rxDiagnosis,
      clinical_notes: rxNotes || null,
      issue_date: new Date().toISOString().split("T")[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: validItems.map((it) => ({
        id: `rxi-${Math.random().toString(36).substring(2, 7)}`,
        ...it,
      })),
      status: "active",
    });

    setTimeout(() => {
      setPrescriptions(store.getPrescriptionsByPet(pet.id));
      setRxSaving(false);
      setShowCreateRxModal(false);
      setRxDiagnosis("");
      setRxNotes("");
      setRxItems([{ medication_name: "", dosage: "", frequency: "كل 12 ساعة", duration: "7 أيام", instructions: "" }]);
      setSelectedRx(newRx);
      setShowRxModal(true);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title={`الملف السريري للمريض: ${pet.name}`}
        subtitle={`صلاحية وصول معتمدة • ${speciesMeta.ar} (${pet.breed || "مختلط"})`}
        role="veterinarian"
        action={{
          label: "تسجيل كشف سريري جديد",
          href: `/veterinarian/visits/new?petId=${pet.id}`,
          icon: <Plus className="h-4 w-4" />,
        }}
      />

      <div className="p-4 md:p-8 space-y-6 max-w-7xl">
        {/* Patient Identity Overview */}
        <Card className="border-border/80 bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-primary/20">
                {pet.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pet.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{pet.name}</h2>
                  <Badge variant="success" className="text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 ml-1" />
                    حالة سريرية مصرح بها
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {speciesMeta.ar} • {pet.breed || "سلالة غير محددة"} • الجنس: {pet.gender === "male" ? "ذكر" : "أنثى"}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>العمر: <strong className="text-foreground">{ageDisplay}</strong></span>
                  <span>الوزن: <strong className="text-foreground">{pet.weight_kg ? `${pet.weight_kg} كجم` : "غير مسجل"}</strong></span>
                  {pet.microchip_number && <span className="font-mono">الشريحة: {pet.microchip_number}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateRxModal(true)}
                className="gap-1.5 text-xs h-9 font-semibold text-emerald-800 border-emerald-300 hover:bg-emerald-50"
              >
                <span className="font-serif italic font-bold">℞</span>
                إصدار روشتة إلكترونية
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVaccineModal(true)}
                className="gap-1.5 text-xs h-9"
              >
                <Syringe className="h-3.5 w-3.5 text-primary" />
                توثيق تطعيم جديد
              </Button>
              <Link href={`/veterinarian/visits/new?petId=${pet.id}`}>
                <Button size="sm" className="gap-1.5 text-xs h-9 font-semibold">
                  <Plus className="h-3.5 w-3.5" />
                  تسجيل كشف سريري
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Modal: Quick Record Vaccine */}
        {showVaccineModal && (
          <Card className="border-primary/40 bg-card p-6 shadow-md animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Syringe className="h-4 w-4 text-primary" />
                توثيق إعطاء تطعيم بيطري رسمي
              </h3>
              <button onClick={() => setShowVaccineModal(false)} className="text-muted-foreground text-xs hover:text-foreground">
                إلغاء
              </button>
            </div>
            <form onSubmit={handleSaveVaccine} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vName" required>اسم اللقاح التجاري</Label>
                  <Input
                    id="vName"
                    required
                    placeholder="مثال: Nobivac Rabies, Purevax..."
                    value={vacName}
                    onChange={(e) => setVacName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vTarget">الأمراض المستهدفة</Label>
                  <Input
                    id="vTarget"
                    placeholder="مثال: السعار، البارفو، الديستمبر..."
                    value={vacTarget}
                    onChange={(e) => setVacTarget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vDate" required>تاريخ الإعطاء</Label>
                  <Input
                    id="vDate"
                    type="date"
                    required
                    value={vacDate}
                    onChange={(e) => setVacDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vNext">تاريخ الجرعة المنشطة القادمة (اختياري)</Label>
                  <Input
                    id="vNext"
                    type="date"
                    value={vacNextDate}
                    onChange={(e) => setVacNextDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vBatch">رقم التشغيلة (Batch Number)</Label>
                  <Input
                    id="vBatch"
                    placeholder="B89201A"
                    value={vacBatch}
                    onChange={(e) => setVacBatch(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vMfg">الشركة المصنعة</Label>
                  <Input
                    id="vMfg"
                    placeholder="MSD, Zoetis, Boehringer..."
                    value={vacManufacturer}
                    onChange={(e) => setVacManufacturer(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowVaccineModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" isLoading={vacSaving}>
                  توثيق واعتماد التطعيم
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Modal: Create Official E-Prescription */}
        {showCreateRxModal && (
          <Card className="border-emerald-500/40 bg-card p-6 shadow-lg animate-in fade-in space-y-5 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif italic font-black text-lg">
                  ℞
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    إصدار روشتة علاجية بيطرية موثقة رقمياً
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    سيتم توليد رقم ترخيص رسمي ورمز QR للتحقق مع توثيق الأدوية في ملف المريض
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateRxModal(false)}
                className="text-muted-foreground text-xs hover:text-foreground"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4 text-right">
              <div>
                <Label htmlFor="rxDiag" required>التشخيص الطبي السريري المعتمد</Label>
                <Input
                  id="rxDiag"
                  required
                  placeholder="مثال: التهاب مفاصل حاد، حساسية جلدية وتسلخات، نزلة معوية..."
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Dynamic Rx Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground">
                    قائمة الأدوية الموصوفة والجرعات:
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRxItem}
                    className="text-xs h-7 gap-1 rounded-lg text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة دواء إضافي
                  </Button>
                </div>

                <div className="space-y-3">
                  {rxItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800">
                          الدواء #{idx + 1}
                        </span>
                        {rxItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRxItem(idx)}
                            className="text-destructive hover:text-destructive/80 p-1"
                            title="حذف هذا الدواء"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <Label className="text-[11px]">اسم الدواء والمادة الفعالة *</Label>
                          <Input
                            required
                            placeholder="مثال: Rimadyl, Augmentin, Otomax..."
                            value={item.medication_name}
                            onChange={(e) => handleUpdateRxItem(idx, "medication_name", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px]">الجرعة المقررة *</Label>
                          <Input
                            required
                            placeholder="مثال: 50 ملغ، قرص واحد، 2 مل بالفم..."
                            value={item.dosage}
                            onChange={(e) => handleUpdateRxItem(idx, "dosage", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <Label className="text-[11px]">معدل التكرار</Label>
                          <Input
                            placeholder="مثال: كل 12 ساعة، مرة يومياً..."
                            value={item.frequency}
                            onChange={(e) => handleUpdateRxItem(idx, "frequency", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px]">مدة العلاج</Label>
                          <Input
                            placeholder="مثال: 7 أيام، أسبوعين..."
                            value={item.duration}
                            onChange={(e) => handleUpdateRxItem(idx, "duration", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px]">تعليمات / تحذير</Label>
                          <Input
                            placeholder="مثال: بعد الأكل مباشرة..."
                            value={item.instructions}
                            onChange={(e) => handleUpdateRxItem(idx, "instructions", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="rxNotes">توصيات إضافية للمربي (اختياري)</Label>
                <Textarea
                  id="rxNotes"
                  placeholder="ملاحظات الراحة، النظام الغذائي، متى يتوقف عن العلاج..."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="rounded-xl min-h-[70px] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateRxModal(false)}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5"
                  isLoading={rxSaving}
                >
                  <ShieldCheck className="h-4 w-4" />
                  اعتماد وإصدار الروشتة رسمياً
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Issued Prescriptions Section */}
        {prescriptions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="font-serif italic font-bold text-primary">℞</span>
                <span>الروشتات الطبية المعتمدة للمريض</span>
              </h3>
              <Badge variant="outline" className="text-xs">
                {prescriptions.length} روشتة
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <Card key={rx.id} className="p-4 border-border bg-card space-y-3 rounded-2xl shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-primary">℞</span>
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded">
                          {rx.rx_number}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground mt-1">التشخيص: {rx.diagnosis}</p>
                    </div>
                    <Badge variant={rx.status === "active" ? "success" : "neutral"} className="text-[10px]">
                      {rx.status === "active" ? "صالحة للصرف" : "تم الصرف"}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span>{rx.items.length} أصناف دوائية: </span>
                    <span className="text-foreground">
                      {rx.items.map((i) => i.medication_name).join("، ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground text-[11px]">{formatArabicDate(rx.issue_date)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRx(rx);
                        setShowRxModal(true);
                      }}
                      className="text-xs h-7 gap-1 font-semibold"
                    >
                      <Printer className="h-3 w-3" />
                      عرض وطباعة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Clinical History Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">السجل السريري الكامل</h3>
            <span className="text-xs text-muted-foreground">{visits.length} تقرير مسجل</span>
          </div>

          {visits.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/60">
              <Stethoscope className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">لم يتم تسجيل أي كشوفات سريرية بعد</p>
              <Link href={`/veterinarian/visits/new?petId=${pet.id}`} className="mt-3 inline-block">
                <Button size="sm">تسجيل أول كشف الآن</Button>
              </Link>
            </div>
          ) : (
            <div>
              {visits.map((v) => (
                <TimelineItem key={v.id} visit={v} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Official Prescription Modal */}
      <PrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        prescription={selectedRx}
        onToggleDispensed={(id) => {
          store.togglePrescriptionDispensed(id);
          const updated = store.getPrescriptionsByPet(pet.id);
          setPrescriptions(updated);
          const found = updated.find((p) => p.id === id);
          if (found) setSelectedRx(found);
        }}
      />
    </div>
  );
}
