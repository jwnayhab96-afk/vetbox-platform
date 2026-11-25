"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArticleDetailClient from "../[slug]/article-client";

function ArticleDetailRoute() {
  const slug = useSearchParams().get("slug") || undefined;
  return <ArticleDetailClient slug={slug} />;
}

export default function ArticleDetailPage() {
  return <Suspense fallback={null}><ArticleDetailRoute /></Suspense>;
}
