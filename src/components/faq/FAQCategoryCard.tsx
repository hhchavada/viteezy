"use client";

import React from "react";
import Link from "next/link";
import { FaqCategory } from "@/store/api/types/faq.types";
import { useTranslations } from "next-intl";
import FallbackImage from "../ui/fallbackImage";

interface FAQCategoryCardProps {
  category: FaqCategory;
  viewType: "grid" | "list";
}

const FAQCategoryCard: React.FC<FAQCategoryCardProps> = ({
  category,
  viewType,
}) => {
  const tFAQ = useTranslations("FAQ");
  const isList = viewType === "list";
  const containerClass = isList
    ? "flex flex-row items-start sm:items-center gap-5 sm:gap-7 p-5 sm:p-6 bg-white rounded-lg border border-gainsboro hover:border-teal-500 transition-colors duration-300"
    : "flex flex-row sm:flex-col items-start gap-5 p-5 sm:p-6 bg-white rounded-lg border border-gainsboro hover:border-teal-500 transition-colors duration-300";

  const imageSizeClass = "w-12 sm:w-14 h-12 sm:h-14";

  const titleClass = isList
    ? "text-lg font-medium text-gray-900 line-clamp-1"
    : "text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1 sm:mt-2";

  const countClass = isList
    ? "text-sm text-gray-500"
    : "text-sm sm:text-base text-gray-600 sm:mt-1";

  const categorySlug = category?.categorySlug;
  const categoryTitle = category?.categoryTitle;
  const articleCount = category?.faqs?.length;
  const categoryImage = category?.categoryImage;
  const articleImage = category?.articleImage;
  const imageSrc = categoryImage || articleImage || "/faq/faq1.png";

  return (
    <Link href={`/faq/${categorySlug}`} className={containerClass}>
      <div
        className={`${imageSizeClass} flex items-center justify-center shrink-0`}
      >
        <FallbackImage
          src={imageSrc}
          alt={categoryTitle}
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      <div className={isList ? "flex-1 min-w-0 sm:pr-4" : "text-left"}>
        <h3 className={`${titleClass} line-clamp-1 break-all`}>{categoryTitle}</h3>
        <p className={countClass}>
          {articleCount}{" "}
          {articleCount === 1 ? tFAQ("articleSingular") : tFAQ("articlePlural")}
        </p>
      </div>
    </Link>
  );
};

export default FAQCategoryCard;
