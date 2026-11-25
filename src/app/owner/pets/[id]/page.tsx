import React from "react";
import PetDetailClient from "./pet-detail-client";

export default function PetDetailPage({ params }: { params: { id: string } }) {
  return <PetDetailClient id={params.id} />;
}
