"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RxPublicVerificationClient from "../rx/[rxNumber]/rx-verify-client";

function RxVerifyRoute() {
  const rxNumber = useSearchParams().get("rxNumber") || undefined;
  return <RxPublicVerificationClient rxNumber={rxNumber} />;
}

export default function RxVerifyPage() {
  return <Suspense fallback={null}><RxVerifyRoute /></Suspense>;
}
