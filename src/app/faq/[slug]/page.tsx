import React from "react";
import FAQArticles from "@/components/faq/FAQArticles";
import { faqCategories } from "@/components/constants/faq";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FAQArticles categorySlug={slug} />;
}
