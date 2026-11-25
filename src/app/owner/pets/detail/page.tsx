"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PetDetailClient from "../[id]/pet-detail-client";

function PetDetailRoute() {
  const id = useSearchParams().get("id") || undefined;
  return <PetDetailClient id={id} />;
}

export default function PetDetailPage() {
  return <Suspense fallback={null}><PetDetailRoute /></Suspense>;
}
