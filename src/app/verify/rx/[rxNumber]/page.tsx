import React from "react";
import RxPublicVerificationClient from "./rx-verify-client";

export default function RxPublicVerificationPage({ params }: { params: { rxNumber: string } }) {
  return <RxPublicVerificationClient rxNumber={params.rxNumber} />;
}
