"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocalizedValue } from "@/lib/utils";
import { useGetQuizConfigurationQuery } from "@/store/api/healthQuizApi";
import type { QuizConfigurationImage } from "@/store/api/types/healthQuiz.types";
import { resolveQuizImageUrl, getQuizConfigurationBackgroundUrls } from "./questions/utils";
import QuizImageGrid from "./QuizImageGrid";
import QuizStartButton from "./QuizStartButton";

function sortQuizImages(images?: QuizConfigurationImage[]): string[] {
  if (!images?.length) return [];

  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => resolveQuizImageUrl(item.image) || item.image)
    .filter(Boolean);
}

export default function QuizStartPage() {
  const locale = useLocale();
  const tQuiz = useTranslations("Quiz");
  const { data } = useGetQuizConfigurationQuery();

  const configuration = data?.data?.configuration;

  const title = useMemo(() => {
    const resolved = resolveLocalizedValue(configuration?.title, locale);
    return resolved.trim() || tQuiz("startTitle");
  }, [configuration?.title, locale, tQuiz]);

  const subtitle = useMemo(() => {
    const resolved = resolveLocalizedValue(configuration?.subtitle, locale);
    return resolved.trim() || tQuiz("startSubtitle");
  }, [configuration?.subtitle, locale, tQuiz]);

  const ctaLabel = useMemo(() => {
    const resolved = resolveLocalizedValue(configuration?.ctaButton, locale);
    return resolved.trim() || tQuiz("startCta");
  }, [configuration?.ctaButton, locale, tQuiz]);

  const imageUrls = useMemo(
    () => sortQuizImages(configuration?.quizImages),
    [configuration?.quizImages]
  );

  const backgroundUrls = useMemo(
    () => getQuizConfigurationBackgroundUrls(configuration),
    [configuration]
  );

  const desktopBackground = backgroundUrls.desktop?.trim() || "";
  const mobileBackground =
    backgroundUrls.mobile?.trim() || desktopBackground || "";
  const hasBackground = Boolean(desktopBackground || mobileBackground);
  const usesResponsiveBackground = Boolean(
    desktopBackground && backgroundUrls.mobile?.trim()
  );

  const backgroundLayerClassName =
    "pointer-events-none absolute inset-0 z-0 min-h-full bg-cover bg-center bg-no-repeat";

  return (
    <section
      className={`relative isolate flex h-dvh w-full flex-col overflow-hidden ${
        hasBackground ? "" : "bg-quiz-start-page"
      }`}
    >
      {usesResponsiveBackground ? (
        <>
          <div
            aria-hidden
            className={`${backgroundLayerClassName} hidden md:block`}
            style={{
              backgroundImage: `url(${desktopBackground})`,
            }}
          />
          <div
            aria-hidden
            className={`${backgroundLayerClassName} md:hidden`}
            style={{
              backgroundImage: `url(${mobileBackground})`,
            }}
          />
        </>
      ) : hasBackground ? (
        <div
          aria-hidden
          className={backgroundLayerClassName}
          style={{
            backgroundImage: `url(${desktopBackground || mobileBackground})`,
          }}
        />
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col items-center justify-center section-padding py-4 sm:py-6 md:py-8">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <QuizImageGrid imageUrls={imageUrls.length ? imageUrls : undefined} />
        </div>

        <div className="mt-4 flex w-full max-w-3xl shrink-0 flex-col items-center px-4 text-center sm:mt-6 md:mt-8">
          <h1 className="font-saans text-[1.5rem] font-medium leading-tight text-black-color sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {title}
          </h1>
          <p className="mt-2 font-saans text-base font-normal text-black-color sm:mt-4 sm:text-lg md:text-xl">
            {subtitle}
          </p>
          <QuizStartButton ctaLabel={ctaLabel} />
        </div>
      </div>
    </section>
  );
}
