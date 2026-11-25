"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VetDetailClient from "../[id]/vet-detail-client";

function VetDetailRoute() {
  const id = useSearchParams().get("id") || undefined;
  return <VetDetailClient id={id} />;
}

export default function VetDetailPage() {
  return <Suspense fallback={null}><VetDetailRoute /></Suspense>;
}
