"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { FAQArticle } from "./types";
import FAQBreadcrumb from "./FAQBreadcrumb";
import { faqCategories } from "../constants/faq";
import { useGetFaqsByLangQuery } from "@/store/api/faqApi";
import Link from "next/link";

interface FAQArticleDetailProps {
  id: string;
  categorySlug: string;
}

const FAQArticleDetail: React.FC<FAQArticleDetailProps> = ({
  id,
  categorySlug,
}) => {
  const locale = useLocale();
  const tFAQ = useTranslations("FAQ");
  const category = faqCategories.find((cat) => cat.slug === categorySlug);

  const { data } = useGetFaqsByLangQuery({ lang: locale });
  const articleData = data?.data.categories?.find(
    (cat) => cat?.categorySlug === categorySlug
  );
  const article = articleData?.faqs?.find((item) => item?._id == id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {tFAQ("articleNotFound")}
          </h1>
          <Link
            href={`/faq/${categorySlug}`}
            className="text-teal-500 hover:underline"
          >
            {tFAQ("returnToCategory")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="  py-8 sm:py-12">
      <FAQBreadcrumb
        items={[
          { label: tFAQ("allArticles"), href: "/faq" },
          {
            label: articleData?.categoryTitle || category?.title || "",
            href: `/faq/${categorySlug}`,
          },
          {
            label: article?.question || "",
            isActive: true,
          },
        ]}
      />

      <article className="mt-7 sm:mt-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 wrap-break-word">
          {article?.question}
        </h1>
        {/* <p className="text-sm text-gray-500 mb-8">
          Updated {article.updatedAt}
        </p> */}

        <div className="prose prose-gray max-w-none">
          <p className="text-base text-gray-700 mb-4 leading-relaxed wrap-break-word">
            {article?.answer}
          </p>
        </div>
      </article>
    </div>
  );
};

export default FAQArticleDetail;
