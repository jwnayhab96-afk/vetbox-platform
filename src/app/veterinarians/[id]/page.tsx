import React from "react";
import VetDetailClient from "./vet-detail-client";
import { store } from "@/lib/data/store";

export function generateStaticParams() {
  return store.getVeterinarians().map((v) => ({ id: v.id }));
}

export default function VetDetailPage({ params }: { params: { id: string } }) {
  return <VetDetailClient id={params.id} />;
}
