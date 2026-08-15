"use client";

import { faqData } from "@/components/constants";
import { FAQSection as FAQSectionTypes } from "@/store/api/types/landing.types";
import React, { memo, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocalizedValue } from "@/lib/utils";

const Plus = ({
  className,
  isOpen,
}: {
  className?: string | number;
  isOpen?: boolean;
}) => (
  <svg
    className={`${className} transition-transform duration-300 ease-in-out ${
      isOpen ? "rotate-45" : "rotate-0"
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

export interface ProductFaq {
  _id?: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

const FAQSection = ({
  data,
  productFaqs,
  className,
}: {
  data?: FAQSectionTypes;
  /** FAQs from product details API - when provided, uses these instead of landing data */
  productFaqs?: ProductFaq[];
  className?: string;
}) => {
  const locale = useLocale();
  const t = useTranslations("Landing");
  const tProducts = useTranslations("Products");
  const [openItems, setOpenItems] = useState<Set<string | number>>(new Set());
  const isHomeFaq = !productFaqs;

  const toggleItem = (id: string | number) => {
    const newOpenItems = new Set(openItems);
    if (openItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Product FAQs take priority, then landing data, then static fallback
  const displayFaqs = useMemo(() => {
    if (productFaqs?.length) {
      return productFaqs.map((faq, index) => ({
        id: faq._id ?? index,
        question: resolveLocalizedValue(faq.question, locale),
        answer: resolveLocalizedValue(faq.answer, locale),
      }));
    }
    
    // Use landing page FAQ data if available
    const landingFaqs = data?.faqs;
    if (landingFaqs?.length) {
      return landingFaqs?.slice(0,4)?.map((faq, index) => ({
        id: index + 1,
        question: faq.question,
        answer: faq.answer,
      }));
    }
    
    // Fallback to static data
    return faqData;
  }, [productFaqs, data?.faqs, locale]);

  // Show section if productFaqs exist or if landing data is enabled and has FAQs
  const shouldShow = productFaqs?.length || (data?.isEnabled && data?.faqs?.length > 0);
  if (!shouldShow) return null;

  return (
    <section className={`section-pb px-4 sm:px-6 relative z-0 ${className ?? ""}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            data-aos="fade-up"
            className="heading-style mb-4 font-saans text-black-color 3xl:text-[42px]"
          >
            {data?.title || t("frequentlyAskedQuestions")}
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="sub-heading-style max-w-2xl mx-auto 3xl:text-[19px]"
          >
            {data?.description ||
              t("faqDescription")}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {displayFaqs.map((item, index) => {
            const isOpen = openItems.has(item.id);

            return (
            <div
              data-aos="fade-up"
              data-aos-delay={index * 100}
              key={item.id}
              className="bg-off-white-color cursor-pointer rounded-lg overflow-hidden  duration-200"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full min-w-0 px-4 sm:px-5 md:px-6 py-4 md:py-5 cursor-pointer text-left flex items-center gap-2 sm:gap-3 hover:bg-off-white-color/90 transition-colors duration-200 ease-in-out focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
              >
                <span
                  className={`flex-1 min-w-0 text-base sm:text-lg md:text-xl font-medium text-black-color leading-snug 3xl:text-[21px] ${
                    isOpen ? "whitespace-normal" : "truncate"
                  }`}
                >
                  {item.question}
                </span>
                <span className="shrink-0 inline-flex items-center justify-center self-center size-6 sm:size-7.5">
                  <Plus
                    className="size-full p-0.5 text-black-color bg-white rounded-full"
                    isOpen={isOpen}
                  />
                </span>
              </button>

              {/* Answer — grid-rows animates to content height (avoids max-h lag) */}
              <div
                id={`faq-answer-${item.id}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div
                    className={`px-4 sm:px-5 md:px-6 pb-5 transition-opacity duration-300 ease-in-out ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="text-charcol-color leading-relaxed text-base 3xl:text-lg wrap-break-word">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Static Warnings & Precautions — homepage only */}
        {isHomeFaq && (
          <div className="text-center mt-12">
            <h3
              data-aos="fade-up"
              className="heading-style mb-3 font-saans text-black-color 3xl:text-[42px]"
            >
              {tProducts("warningsPrecautions")}
            </h3>
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="sub-heading-style max-w-4xl mx-auto leading-snug 3xl:text-[19px]"
            >
              {tProducts("warningsPrecautionsContent")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(FAQSection);
