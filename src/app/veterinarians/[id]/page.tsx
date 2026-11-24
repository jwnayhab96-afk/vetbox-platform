"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { store } from "@/lib/data/store";
import {
  Stethoscope,
  ShieldCheck,
  Building,
  Award,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

export default function VetDetailPage() {
  const params = useParams();
  const vetId = params.id as string;
  const vet = store.getVeterinarianById(vetId);
  const currentProfile = store.getCurrentProfile();
  const userPets = store.getPets(currentProfile.id);

  const [selectedPet, setSelectedPet] = useState("");
  const [requested, setRequested] = useState(false);

  if (!vet) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container py-20 text-center space-y-4">
          <h2 className="text-xl font-bold">الطبيب غير موجود</h2>
          <Link href="/veterinarians">
            <Button variant="outline">العودة لدليل الأطباء</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    store.createConnectionRequest(selectedPet, vet.id, currentProfile.id);
    setRequested(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="container max-w-4xl space-y-8">
          <Link href="/veterinarians" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <ArrowRight className="h-4 w-4" />
            العودة لكل الأطباء البيطريين
          </Link>

          {/* Profile Card */}
          <Card className="border-border shadow-xs bg-card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-muted overflow-hidden shrink-0 border-2 border-primary/20">
                {vet.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vet.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary bg-primary/10">
                    <Stethoscope className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-right flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{vet.profile?.full_name}</h1>
                  <Badge variant="success" className="text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 ml-1" />
                    طبيب بيطري معتمد
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{vet.education}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                  <span className="font-mono bg-muted px-2 py-0.5 rounded">رقم القيد: {vet.license_number}</span>
                  <span>الخبرة: <strong>{vet.years_of_experience} سنوات</strong></span>
                  <span>الكشف: <strong>{vet.consultation_fee} ج.م</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 mt-6 space-y-4 text-right">
              <h3 className="font-bold text-base text-foreground">عن الطبيب والخبرات السريرية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{vet.bio}</p>

              {vet.clinic_affiliation_name && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-xs text-muted-foreground block">العيادة أو المستشفى:</span>
                    <strong className="text-sm text-foreground">{vet.clinic_affiliation_name}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Connect Section */}
            <div className="pt-6 border-t border-border/60 mt-6 text-right space-y-3">
              <h3 className="font-bold text-base text-foreground">ربط حيوانك بهذا الطبيب</h3>
              {requested ? (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  تم إرسال طلب الربط بنجاح إلى الطبيب. ستصلك رسالة فور اعتماده.
                </div>
              ) : (
                <form onSubmit={handleConnect} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    required
                    className="flex-1 h-10 rounded-lg border border-input bg-card px-3 text-xs md:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- اختر الحيوان الذي تريد ربطه --</option>
                    {userPets.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.breed || p.species})</option>
                    ))}
                  </select>
                  <Button type="submit" className="font-semibold text-xs h-10">
                    إرسال طلب ربط طبي
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
