import React from "react";
import ClinicDetailClient from "./clinic-detail-client";

export default function ClinicDetailPage({ params }: { params: { id: string } }) {
  return <ClinicDetailClient id={params.id} />;
}
