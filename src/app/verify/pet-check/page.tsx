"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PetPassportVerificationClient from "../pet/[petId]/pet-passport-client";

function PetVerifyRoute() {
  const petId = useSearchParams().get("petId") || "";
  return <PetPassportVerificationClient petId={petId} />;
}

export default function PetVerifyPage() {
  return <Suspense fallback={null}><PetVerifyRoute /></Suspense>;
}
