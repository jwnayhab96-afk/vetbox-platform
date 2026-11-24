import React from "react";
import VetPatientDetailClient from "./patient-detail-client";
import { store } from "@/lib/data/store";

export function generateStaticParams() {
  return store.getPets().map((p) => ({ petId: p.id }));
}

export default function VetPatientDetailPage({ params }: { params: { petId: string } }) {
  return <VetPatientDetailClient petId={params.petId} />;
}
