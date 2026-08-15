"use client";

import React, { useMemo } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useFaqView } from "@/lib/faqViewContext";
import FAQCategoryCard from "./FAQCategoryCard";
import ViewSwitcher from "./ViewSwitcher";
import { useGetFaqsByLangQuery } from "@/store/api/faqApi";
import { filterFaqCategoriesByQuery } from "@/lib/faqSearch";

const FAQCategories: React.FC = () => {
  const locale = useLocale();
  const { viewType, setViewType, searchQuery } = useFaqView();
  const tFAQ = useTranslations("FAQ");
  const { data } = useGetFaqsByLangQuery({ lang: locale });
  const categories = data?.data?.categories ?? [];
  const filteredCategories = useMemo(
    () => filterFaqCategoriesByQuery(categories, searchQuery),
    [categories, searchQuery]
  );

  return (
    <div className="py-7 sm:py-12">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-medium text-gray-900">
          {tFAQ("getMoreInformation")}
        </h2>
        <span className="hidden sm:block">
          <ViewSwitcher />
        </span>
      </div>

      {/* Categories Grid/List */}
      {filteredCategories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {searchQuery
            ? tFAQ("noCategoriesOrArticlesMatchYourSearch")
            : tFAQ("noCategoriesAvailable")}
        </p>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {filteredCategories.map((category) => (
            <FAQCategoryCard
              key={category.categoryId}
              category={category}
              viewType="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-5">
          {filteredCategories.map((category) => (
            <FAQCategoryCard
              key={category.categoryId}
              category={category}
              viewType="list"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQCategories;
