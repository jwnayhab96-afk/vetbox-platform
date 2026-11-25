"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VetPatientDetailClient from "../[petId]/patient-detail-client";

function PatientDetailRoute() {
  const petId = useSearchParams().get("petId") || undefined;
  return <VetPatientDetailClient petId={petId} />;
}

export default function PatientDetailPage() {
  return <Suspense fallback={null}><PatientDetailRoute /></Suspense>;
}
