"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClinicDetailClient from "../[id]/clinic-detail-client";

function ClinicDetailRoute() {
  const id = useSearchParams().get("id") || undefined;
  return <ClinicDetailClient id={id} />;
}

export default function ClinicDetailPage() {
  return <Suspense fallback={null}><ClinicDetailRoute /></Suspense>;
}
