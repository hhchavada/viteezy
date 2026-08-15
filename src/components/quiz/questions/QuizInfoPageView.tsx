"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

import type { QuizInfoPage } from "@/store/api/types/healthQuiz.types";
import {
  getLocalizedInfoPageText,
  normalizeInfoPageBenefits,
  normalizeInfoPageReviews,
  resolveQuizImageUrl,
} from "./utils";
import QuizInfoReviewsCarousel from "./QuizInfoReviewsCarousel";

interface QuizInfoPageViewProps {
  infoPage: QuizInfoPage;
}

function CheckIcon() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-green-color">
      <svg
        className="size-4 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export default function QuizInfoPageView({ infoPage }: QuizInfoPageViewProps) {
  const locale = useLocale();

  const subtitle = getLocalizedInfoPageText(infoPage.subtitle, locale).trim();
  const displayTitle = getLocalizedInfoPageText(infoPage.displayTitle, locale).trim();
  const benefits = normalizeInfoPageBenefits(infoPage.benefits, locale);
  const reviews = normalizeInfoPageReviews(infoPage.reviews, locale);
  const supportingImageUrl = resolveQuizImageUrl(
    infoPage.supportingImage ?? undefined
  );

  const hasDisplayTitle = Boolean(displayTitle);
  const hasSubtitle = Boolean(subtitle);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto lg:overflow-visible">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 pb-4 pt-10 text-center sm:gap-8 sm:pt-12 md:pt-14">
        {(hasDisplayTitle || hasSubtitle) && (
          <div className="flex w-full flex-col items-center gap-3">
            {hasSubtitle ? (
              <p className="font-saans text-base font-normal leading-relaxed text-[#4B5563] sm:text-lg">
                {subtitle}
              </p>
            ) : null}
            {hasDisplayTitle ? (
              <h1 className="font-saans text-[1.75rem] font-bold leading-tight text-black-color sm:text-3xl md:text-[2.5rem] md:leading-tight">
                {displayTitle}
              </h1>
            ) : null}
          </div>
        )}

        {supportingImageUrl ? (
          <div className="relative h-20 w-32 sm:h-24 sm:w-36">
            <Image
              src={supportingImageUrl}
              alt=""
              fill
              className="object-contain"
              sizes="144px"
            />
          </div>
        ) : null}

        {benefits.length > 0 ? (
          <ul className="flex w-full max-w-md flex-col gap-5 text-left">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckIcon />
                <span className="pt-0.5 font-saans text-base font-medium leading-snug text-black-color">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {reviews.length > 0 ? (
          <QuizInfoReviewsCarousel
            reviews={reviews}
            autoScrollSpeed={
              reviews.length > 1
                ? infoPage.duration && infoPage.duration > 0
                  ? Math.min(2, Math.max(0.6, 6 / infoPage.duration))
                  : 1
                : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}
