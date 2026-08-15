"use client";

import React, { useMemo } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useFaqView } from "@/lib/faqViewContext";
import FAQArticleCard from "./FAQArticleCard";
import FAQBreadcrumb from "./FAQBreadcrumb";
import ViewSwitcher from "./ViewSwitcher";
import { faqCategories } from "../constants/faq";
import { useGetFaqsByLangQuery } from "@/store/api/faqApi";
import { filterFaqsByQuery } from "@/lib/faqSearch";
import Link from "next/link";

interface FAQArticlesProps {
  categorySlug: string;
}

const FAQArticles: React.FC<FAQArticlesProps> = ({ categorySlug }) => {
  const locale = useLocale();
  const tFAQ = useTranslations("FAQ");
  const { viewType, setViewType, searchQuery } = useFaqView();
  const category = faqCategories.find((cat) => cat.slug === categorySlug);
  const { data } = useGetFaqsByLangQuery({ lang: locale });
  const articleData = data?.data?.categories?.find(
    (cat) => cat?.categorySlug === categorySlug
  );
  const allArticles = articleData?.faqs ?? [];
  const articles = useMemo(
    () => filterFaqsByQuery(allArticles, searchQuery),
    [allArticles, searchQuery]
  );

  if (!articles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {tFAQ("categoryNotFound")}
          </h1>
          <Link href="/faq" className="text-teal-500 hover:underline">
            {tFAQ("returnToFAQ")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-7 sm:py-12">
      <FAQBreadcrumb
        items={[
          { label: tFAQ("allArticles"), href: "/faq" },
          {
            label: articleData?.categoryTitle || category?.title || "",
            href: `/faq/${categorySlug}`,
            isActive: true,
          },
        ]}
      />

      <div className="flex items-center justify-between mt-8 sm:mt-10">
        <div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            {tFAQ("getMoreInformation")}
          </h2>
          <p className="text-base text-gray-600">
            {tFAQ("everythingYouNeedToKnowAboutManagingYourViteezySubscription")}
          </p>
        </div>

        <span className="hidden md:block">
          <ViewSwitcher />
        </span>
      </div>
      <hr className="border-gray-200 my-6 sm:my-9" />
      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {searchQuery
            ? tFAQ("noArticlesMatchYourSearch")
            : tFAQ("noArticlesInThisCategory")}
        </p>
      ) : (
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-5"
              : "space-y-5"
          }
        >
          {articles.map((item) => (
            <FAQArticleCard
              key={item._id}
              faq={item}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQArticles;
