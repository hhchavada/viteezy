import React from "react";
import FAQArticleDetail from "@/components/faq/FAQArticleDetail";
import { getArticleById } from "@/components/faq/articleData";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;

  return <FAQArticleDetail id={id} categorySlug={slug} />;
}
