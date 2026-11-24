import React from "react";
import ClinicDetailClient from "./clinic-detail-client";
import { store } from "@/lib/data/store";

export function generateStaticParams() {
  return store.getClinics().map((c) => ({ id: c.id }));
}

export default function ClinicDetailPage({ params }: { params: { id: string } }) {
  return <ClinicDetailClient id={params.id} />;
}
