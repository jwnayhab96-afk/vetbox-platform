import React from "react";
import PetPassportVerificationClient from "./pet-passport-client";

export default function PetPassportVerificationPage({ params }: { params: { petId: string } }) {
  return <PetPassportVerificationClient petId={params.petId} />;
}
