import type { Supplement } from "@/types/recommendations";

export const RECOMMENDATION_BORDER_COLOR = "#E3E3DC";
export const RECOMMENDATION_MIN_DOSAGE = 1;
export const RECOMMENDATION_MAX_DOSAGE = 2;
export const QUIZ_CHECKOUT_INITIALIZED_KEY = "quizCheckoutInitialized";
export const QUIZ_CHECKOUT_ACTIVE_KEY = "quizCheckoutActive";
export const QUIZ_CHECKOUT_CONTEXT_KEY = "quizCheckoutContext";
export const QUIZ_RECOMMENDATION_CART_TYPE = "QUIZ_RECOMMENDATION";

export function isActiveBundleSupplement(supplement: Supplement): boolean {
  return (
    supplement.disabled !== true &&
    supplement.removed !== true &&
    supplement.isUserRemoved !== true
  );
}

export function countActiveBundleSupplements(supplements: Supplement[]): number {
  return supplements.filter(isActiveBundleSupplement).length;
}
