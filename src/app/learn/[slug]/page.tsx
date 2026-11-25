import React from "react";
import ArticleDetailClient from "./article-client";

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  return <ArticleDetailClient slug={params.slug} />;
}
