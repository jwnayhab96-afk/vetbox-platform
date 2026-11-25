import React from "react";
import VetPatientDetailClient from "./patient-detail-client";

export default function VetPatientDetailPage({ params }: { params: { petId: string } }) {
  return <VetPatientDetailClient petId={params.petId} />;
}
