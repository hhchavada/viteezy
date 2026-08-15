import type { CSSProperties } from "react";
import type {
  LocalizedText,
  QuizConfiguration,
  QuizInfoPage,
  QuizQuestion,
} from "@/store/api/types/healthQuiz.types";
import { DEFAULT_QUIZ_BACKGROUND, INFO_PAGE_FALLBACK_BACKGROUND } from "./constants";
import { QUIZ_API_BASE_URL } from "@/store/api/healthQuizApi";
import { parseDateValue, resolveDatePickerConfig, validateDateAnswer } from "./dateValidation";
import { validateGeneralTextAnswer } from "./generalQuestionValidation";
import { resolveLocalizedValue } from "@/lib/utils";

export function getLocalizedText(
  value?: LocalizedText,
  locale = "en"
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || Object.values(value).find(Boolean) || "";
}

export function resolveQuizImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;

  const mediaBase = QUIZ_API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  return `${mediaBase}/${path.replace(/^\//, "")}`;
}

export function getQuestionBackgroundUrls(question?: QuizQuestion): {
  desktop: string;
  mobile: string;
} {
  const desktop =
    resolveQuizImageUrl(question?.backgroundImage ?? undefined) ||
    DEFAULT_QUIZ_BACKGROUND;
  const mobile =
    resolveQuizImageUrl(question?.mobileBackgroundImage ?? undefined) ||
    resolveQuizImageUrl(question?.backgroundImage ?? undefined) ||
    DEFAULT_QUIZ_BACKGROUND;

  return { desktop, mobile };
}

export function getQuestionBackgroundUrl(question?: QuizQuestion): string {
  return getQuestionBackgroundUrls(question).desktop;
}

export function hasQuestionBackgroundImage(question?: QuizQuestion): boolean {
  return Boolean(
    resolveQuizImageUrl(question?.backgroundImage ?? undefined) ||
      resolveQuizImageUrl(question?.mobileBackgroundImage ?? undefined)
  );
}

export function getQuizConfigurationBackgroundUrls(
  configuration?: QuizConfiguration | null
): {
  desktop?: string;
  mobile?: string;
} {
  return {
    desktop: resolveQuizImageUrl(configuration?.backgroundImage ?? undefined),
    mobile: resolveQuizImageUrl(
      configuration?.mobileBackgroundImage ?? undefined
    ),
  };
}

export function getInfoPageBackgroundUrls(infoPage?: QuizInfoPage | null): {
  desktop?: string;
  mobile?: string;
} {
  return {
    desktop: resolveQuizImageUrl(infoPage?.backgroundImage ?? undefined),
    mobile: resolveQuizImageUrl(infoPage?.mobileBackgroundImage ?? undefined),
  };
}

export function getInfoPageBackgroundUrl(infoPage?: QuizInfoPage | null): string {
  const { desktop, mobile } = getInfoPageBackgroundUrls(infoPage);
  return desktop || mobile || DEFAULT_QUIZ_BACKGROUND;
}

export function hasInfoPageBackgroundImage(
  infoPage?: QuizInfoPage | null
): boolean {
  return Boolean(
    resolveQuizImageUrl(infoPage?.backgroundImage ?? undefined) ||
      resolveQuizImageUrl(infoPage?.mobileBackgroundImage ?? undefined)
  );
}

export function getInfoPageFallbackBackgroundStyle(): CSSProperties {
  return { background: INFO_PAGE_FALLBACK_BACKGROUND };
}

export function getLocalizedInfoPageText(
  value?: LocalizedText,
  locale = "en"
): string {
  return resolveLocalizedValue(value, locale);
}

export function normalizeInfoPageBenefits(
  benefits: QuizInfoPage["benefits"],
  locale = "en"
): string[] {
  if (!benefits?.length) return [];

  return benefits
    .map((benefit, index) => {
      if (typeof benefit === "string") {
        return { text: benefit.trim(), sortOrder: index };
      }

      return {
        text: getLocalizedInfoPageText(benefit.text, locale).trim(),
        sortOrder: benefit.sortOrder ?? index,
      };
    })
    .filter((benefit) => benefit.text)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((benefit) => benefit.text);
}

export interface NormalizedInfoPageReview {
  id: string;
  reviewerName: string;
  reviewDescription: string;
  rating: number;
  photo?: string | null;
}

export function normalizeInfoPageReviews(
  reviews: QuizInfoPage["reviews"],
  locale = "en"
): NormalizedInfoPageReview[] {
  if (!reviews?.length) return [];

  return [...reviews]
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((review, index) => ({
      id: review._id ?? `review-${index}`,
      reviewerName: getLocalizedInfoPageText(review.reviewerName, locale).trim(),
      reviewDescription: getLocalizedInfoPageText(
        review.reviewDescription,
        locale
      ).trim(),
      rating: Number.isFinite(review.rating) ? review.rating : 0,
      photo: review.photo,
    }))
    .filter(
      (review) => review.reviewerName || review.reviewDescription
    );
}

export function isManualSubmitQuestion(question: QuizQuestion): boolean {
  if (question.answerType === "text" || question.answerType === "date_picker") {
    return true;
  }
  if (question.isRequired === false) {
    return true;
  }
  return question.answerSelection === "multiple";
}

export function isOptionalQuestion(question: QuizQuestion): boolean {
  return question.isRequired === false;
}

export function hasQuestionAnswer(
  question: QuizQuestion,
  selectedValues: string[],
  textValue: string
): boolean {
  if (question.answerType === "answer") {
    return selectedValues.length > 0;
  }

  if (question.answerType === "text") {
    return textValue.trim().length > 0;
  }

  if (question.answerType === "date_picker") {
    const parts = parseDateValue(textValue, resolveDatePickerConfig(question));
    return Boolean(parts.year || parts.month || parts.day);
  }

  return false;
}

export function isQuestionSkipped(
  question: QuizQuestion,
  selectedValues: string[],
  textValue: string
): boolean {
  if (!isOptionalQuestion(question)) return false;
  return !hasQuestionAnswer(question, selectedValues, textValue);
}

export function shouldUseCardLayout(question: QuizQuestion): boolean {
  if (question.answerType !== "answer") return false;
  if (question.answerSelection === "multiple") return true;
  return question.options.some(
    (option) => Boolean(option.subtitle || option.image)
  );
}

export function sortOptions<T extends { sortOrder: number }>(options: T[]): T[] {
  return [...options].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isAnswerComplete(
  question: QuizQuestion,
  selectedValues: string[],
  textValue: string
): boolean {
  if (question.answerType === "answer") {
    if (question.answerSelection === "multiple") {
      const min = 1;
      const max = question.maxSelection ?? question.options.length;
      return selectedValues.length >= min && selectedValues.length <= max;
    }
    return selectedValues.length === 1;
  }

  if (question.answerType === "text") {
    return validateGeneralTextAnswer(question, textValue).valid;
  }

  if (question.answerType === "date_picker") {
    return validateDateAnswer(question, textValue).valid;
  }

  return false;
}
