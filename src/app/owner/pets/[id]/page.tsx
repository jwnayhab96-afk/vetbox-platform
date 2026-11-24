import React from "react";
import PetDetailClient from "./pet-detail-client";
import { store } from "@/lib/data/store";

export function generateStaticParams() {
  return store.getPets().map((p) => ({ id: p.id }));
}

export default function PetDetailPage({ params }: { params: { id: string } }) {
  return <PetDetailClient id={params.id} />;
}
