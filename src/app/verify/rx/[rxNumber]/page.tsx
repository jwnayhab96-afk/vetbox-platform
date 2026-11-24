import React from "react";
import RxPublicVerificationClient from "./rx-verify-client";

export function generateStaticParams() {
  return [
    { rxNumber: "RX-2024-001" },
    { rxNumber: "demo" },
  ];
}

export default function RxPublicVerificationPage({ params }: { params: { rxNumber: string } }) {
  return <RxPublicVerificationClient rxNumber={params.rxNumber} />;
}
