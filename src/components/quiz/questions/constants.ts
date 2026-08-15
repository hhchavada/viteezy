export const DEFAULT_QUIZ_BACKGROUND = "/quiz/background.png";

/**
 * Figma fallback when an info page has no background image.
 * White base with 50% #F5EED0 overlay (layers stacked for CSS rendering).
 */
export const INFO_PAGE_FALLBACK_BACKGROUND =
  "linear-gradient(0deg, rgba(245, 238, 208, 0.5), rgba(245, 238, 208, 0.5)), linear-gradient(0deg, #FFFFFF, #FFFFFF)";

/** Seconds to show an info page when API omits `duration`. */
export const DEFAULT_INFO_PAGE_DURATION_SECONDS = 3;

export const QUIZ_SESSION_STORAGE_KEY = "healthQuizSessionId";
export const QUIZ_SESSION_DATA_KEY = `${QUIZ_SESSION_STORAGE_KEY}_data`;
export const QUIZ_SESSION_COMPLETED_KEY = `${QUIZ_SESSION_STORAGE_KEY}_completed`;
export const QUIZ_COMPLETED_SESSION_ID_KEY = `${QUIZ_SESSION_STORAGE_KEY}_completedId`;
/** Guest token backup used after quiz completion (before recommendation complete API). */
export const QUIZ_COMPLETED_GUEST_TOKEN_KEY = `${QUIZ_SESSION_STORAGE_KEY}_completedGuestToken`;
/** Recommendation id from quiz magic-link sign-in. */
export const QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY = `${QUIZ_SESSION_STORAGE_KEY}_magicLinkRecommendationId`;
export const QUIZ_SAVE_PROGRESS_KEY = `${QUIZ_SESSION_STORAGE_KEY}_saveProgress`;
export const QUIZ_RESUME_FROM_API_KEY = `${QUIZ_SESSION_STORAGE_KEY}_resumeFromApi`;
