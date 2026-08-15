import type { PlanTier } from "@/types/recommendations";
import {
  QUIZ_CHECKOUT_ACTIVE_KEY,
  QUIZ_CHECKOUT_CONTEXT_KEY,
  QUIZ_CHECKOUT_INITIALIZED_KEY,
  QUIZ_RECOMMENDATION_CART_TYPE,
} from "./constants";

export type QuizCheckoutPageSummaryBody = {
  cartId: string;
  cartType: typeof QUIZ_RECOMMENDATION_CART_TYPE;
};

export type QuizRecommendationCartParams = {
  cartType: typeof QUIZ_RECOMMENDATION_CART_TYPE;
  recommendationId: string;
  bundleType: PlanTier;
};

export type QuizCheckoutContext = QuizCheckoutPageSummaryBody &
  QuizRecommendationCartParams;

/** RTK Query requires stable args even when `skip: true`. */
export const QUIZ_PAGE_SUMMARY_QUERY_PLACEHOLDER: QuizCheckoutPageSummaryBody =
  {
    cartId: "",
    cartType: QUIZ_RECOMMENDATION_CART_TYPE,
  };

export const QUIZ_CART_QUERY_PLACEHOLDER: QuizRecommendationCartParams = {
  cartType: QUIZ_RECOMMENDATION_CART_TYPE,
  recommendationId: "",
  bundleType: "essential",
};

export function buildQuizCheckoutContext(input: {
  cartId: string;
  recommendationId: string;
  bundleType: PlanTier;
}): QuizCheckoutContext {
  return {
    cartId: input.cartId,
    cartType: QUIZ_RECOMMENDATION_CART_TYPE,
    recommendationId: input.recommendationId,
    bundleType: input.bundleType,
  };
}

export function toQuizPageSummaryBody(
  context: QuizCheckoutContext
): QuizCheckoutPageSummaryBody {
  return {
    cartId: context.cartId,
    cartType: context.cartType,
  };
}

export function toQuizCartParams(
  context: QuizCheckoutContext
): QuizRecommendationCartParams {
  return {
    cartType: context.cartType,
    recommendationId: context.recommendationId,
    bundleType: context.bundleType,
  };
}

export function saveQuizCheckoutSession(context: QuizCheckoutContext): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(QUIZ_CHECKOUT_ACTIVE_KEY, "true");
  sessionStorage.setItem(QUIZ_CHECKOUT_INITIALIZED_KEY, "true");
  sessionStorage.setItem(QUIZ_CHECKOUT_CONTEXT_KEY, JSON.stringify(context));
}

export function readQuizCheckoutContext(): QuizCheckoutContext | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(QUIZ_CHECKOUT_CONTEXT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<QuizCheckoutContext> & {
      type?: string;
    };
    const cartType =
      parsed.cartType ??
      (parsed.type === QUIZ_RECOMMENDATION_CART_TYPE
        ? QUIZ_RECOMMENDATION_CART_TYPE
        : undefined);

    if (
      parsed.cartId &&
      cartType === QUIZ_RECOMMENDATION_CART_TYPE &&
      parsed.recommendationId &&
      parsed.bundleType
    ) {
      return {
        cartId: parsed.cartId,
        cartType,
        recommendationId: parsed.recommendationId,
        bundleType: parsed.bundleType,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function isQuizCheckoutSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(QUIZ_CHECKOUT_ACTIVE_KEY) === "true";
}

export function clearQuizCheckoutInitializedFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUIZ_CHECKOUT_INITIALIZED_KEY);
}

export function clearQuizCheckoutSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(QUIZ_CHECKOUT_ACTIVE_KEY);
  sessionStorage.removeItem(QUIZ_CHECKOUT_INITIALIZED_KEY);
  sessionStorage.removeItem(QUIZ_CHECKOUT_CONTEXT_KEY);
}
