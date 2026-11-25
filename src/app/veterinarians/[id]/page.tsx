import React from "react";
import VetDetailClient from "./vet-detail-client";

export default function VetDetailPage({ params }: { params: { id: string } }) {
  return <VetDetailClient id={params.id} />;
}
