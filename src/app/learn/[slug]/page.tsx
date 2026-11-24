import React from "react";
import ArticleDetailClient from "./article-client";
import { store } from "@/lib/data/store";

export function generateStaticParams() {
  return store.getArticles().map((a) => ({ slug: a.slug }));
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  return <ArticleDetailClient slug={params.slug} />;
}
