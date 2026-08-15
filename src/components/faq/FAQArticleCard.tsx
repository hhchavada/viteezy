"use client";

import React from "react";
import Link from "next/link";
import { FaqItem } from "@/store/api/types/faq.types";

interface FAQArticleCardProps {
  faq: FaqItem;
  categorySlug: string;
}

const FAQArticleCard: React.FC<FAQArticleCardProps> = ({
  faq,
  categorySlug,
}) => {
  return (
    <Link
      href={`/faq/${categorySlug}/${faq?._id}`}
      className="block p-6 bg-white rounded-lg border border-gainsboro h-full hover:border-teal-500  duration-300"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-3 wrap-break-word line-clamp-2">
        {faq?.question}
      </h3>
      <p className="text-base text-gray-600 line-clamp-4 wrap-break-word">{faq?.answer}</p>
    </Link>
  );
};

export default FAQArticleCard;
