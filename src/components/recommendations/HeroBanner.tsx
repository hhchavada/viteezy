"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import StarRating from "./StarRating";

const HERO_BG_IMAGE = "/recommendation/hero-bg.png";
const HERO_WIDTH = 3360;
const HERO_HEIGHT = 738;

interface HeroBannerProps {
  userName: string;
  averageReview: number;
}

export default function HeroBanner({ userName, averageReview }: HeroBannerProps) {
  const t = useTranslations("Recommendations");

  return (
    <section className="relative w-full overflow-hidden rounded-2xl">
      <Image
        src={HERO_BG_IMAGE}
        alt={t("heroBannerAlt")}
        width={HERO_WIDTH}
        height={HERO_HEIGHT}
        priority
        unoptimized
        sizes="100vw"
        className="block h-auto w-full min-h-[150px]"
      />

      <div className="absolute inset-0 flex items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 lg:px-10 xl:px-12">
        <div className="w-full max-w-[78%] sm:max-w-[62%] md:max-w-[54%] lg:max-w-[min(520px,50%)]">
          <p className="font-saans text-[10px] leading-tight text-light-gray-color sm:text-xs md:text-sm lg:text-base">
            {t("heroEyebrow")}
          </p>

          <h1 className="mt-0.5 font-saans text-lg font-medium leading-tight text-black-color sm:mt-1 sm:text-xl md:text-2xl lg:text-3xl xl:text-[40px]">
            {t("heroTitle", { userName })}
          </h1>

          <p className="mt-0.5 font-saans text-[10px] leading-snug text-light-gray-color line-clamp-2 wrap-break-word sm:mt-1 sm:text-xs sm:leading-5 md:mt-1.5 md:text-sm lg:mt-2 lg:text-[15px] lg:leading-6">
            {t("heroDescription")}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-1 font-saans text-[10px] text-charcol-color sm:mt-1.5 sm:gap-1.5 sm:text-xs md:mt-2 md:text-sm lg:mt-3 lg:text-base">
            <span>
              {t("heroAverageReview")}{" "}
              <span className="font-semibold text-black-color">{averageReview}</span>
            </span>
            <StarRating rating={averageReview} />
          </div>
        </div>
      </div>
    </section>
  );
}
