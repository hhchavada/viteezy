import {
  QUIZ_COMPLETED_SESSION_ID_KEY,
  QUIZ_COMPLETED_GUEST_TOKEN_KEY,
  QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY,
  QUIZ_RESUME_FROM_API_KEY,
  QUIZ_SESSION_COMPLETED_KEY,
  QUIZ_SESSION_DATA_KEY,
  QUIZ_SESSION_STORAGE_KEY,
} from "./constants";
import { clearQuizNavigationState } from "./quizNavigationStorage";
import type {
  QuizCompleteData,
  QuizSessionData,
} from "@/store/api/types/healthQuiz.types";
import { hasAuthToken } from "@/lib/utils";
import {
  clearQuizGuestToken,
  getQuizGuestToken,
  persistCompletedQuizGuestToken,
  syncQuizGuestAuth,
  withStoredGuestToken,
} from "@/lib/quizGuestToken";

export function isQuizSessionCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(QUIZ_SESSION_COMPLETED_KEY) === "true";
}

export function getCompletedQuizSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(QUIZ_COMPLETED_SESSION_ID_KEY);
}

export function getMagicLinkRecommendationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY)?.trim() || null;
}

export type RecommendationCompleteSource =
  | { type: "session"; id: string }
  | { type: "recommendation"; id: string };

export function resolveRecommendationCompleteSource():
  | RecommendationCompleteSource
  | null {
  const sessionId = getCompletedQuizSessionId()?.trim();
  if (sessionId) {
    return { type: "session", id: sessionId };
  }

  return null;
}

/** Pending recommendation from active-session lookup — use session complete API. */
export function persistPendingRecommendationFromActiveSession(data: {
  sessionId: string;
  recommendationId: string;
}) {
  const sessionId = data.sessionId?.trim();
  if (!sessionId) return;

  localStorage.setItem(QUIZ_SESSION_COMPLETED_KEY, "true");
  localStorage.setItem(QUIZ_COMPLETED_SESSION_ID_KEY, sessionId);
  localStorage.removeItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY);

  const recommendationId = data.recommendationId?.trim();
  if (recommendationId) {
    localStorage.setItem(QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY, recommendationId);
  }

  clearActiveQuizSession({ clearGuestToken: false });
}

export function persistMagicLinkRecommendationContext(data: {
  recommendationId: string;
  sessionId: string;
}) {
  if (typeof window === "undefined") return;

  const sessionId = data.sessionId?.trim();
  if (!sessionId) return;

  localStorage.setItem(QUIZ_SESSION_COMPLETED_KEY, "true");
  localStorage.removeItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY);
  localStorage.setItem(QUIZ_COMPLETED_SESSION_ID_KEY, sessionId);

  const recommendationId = data.recommendationId?.trim();
  if (recommendationId) {
    localStorage.setItem(QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY, recommendationId);
  }
}

export function syncCompletedQuizFromResponse(data?: QuizCompleteData | null) {
  if (typeof window === "undefined" || !data) return;

  localStorage.setItem(QUIZ_SESSION_COMPLETED_KEY, "true");

  const sessionId = data.sessionId?.trim();
  if (sessionId) {
    localStorage.setItem(QUIZ_COMPLETED_SESSION_ID_KEY, sessionId);
  }

  const recommendationId = data.recommendationId?.trim() || data._id?.trim();
  if (recommendationId) {
    localStorage.setItem(QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY, recommendationId);
  }
}

function resolveGuestTokenBeforeCompletion(): string | null {
  const existing = getQuizGuestToken();
  if (existing) return existing;

  try {
    const raw =
      sessionStorage.getItem(QUIZ_SESSION_DATA_KEY) ||
      localStorage.getItem(QUIZ_SESSION_DATA_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { guestToken?: string };
    return parsed.guestToken?.trim() || null;
  } catch {
    return null;
  }
}

export function markQuizSessionCompleted(sessionId?: string | null) {
  if (!hasAuthToken()) {
    const guestToken = resolveGuestTokenBeforeCompletion();
    if (guestToken) {
      persistCompletedQuizGuestToken(guestToken);
    }
  }

  localStorage.setItem(QUIZ_SESSION_COMPLETED_KEY, "true");

  if (sessionId) {
    localStorage.setItem(QUIZ_COMPLETED_SESSION_ID_KEY, sessionId);
    clearQuizNavigationState(sessionId);
  }

  sessionStorage.removeItem(QUIZ_SESSION_DATA_KEY);
  sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
  localStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
  localStorage.removeItem(QUIZ_SESSION_DATA_KEY);
}

export function clearQuizSessionCompleted() {
  localStorage.removeItem(QUIZ_SESSION_COMPLETED_KEY);
  localStorage.removeItem(QUIZ_COMPLETED_SESSION_ID_KEY);
  localStorage.removeItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY);
  localStorage.removeItem(QUIZ_MAGIC_LINK_RECOMMENDATION_ID_KEY);
}

export function clearActiveQuizSession(options?: { clearGuestToken?: boolean }) {
  const sessionId = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
  sessionStorage.removeItem(QUIZ_SESSION_DATA_KEY);
  sessionStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);
  localStorage.removeItem(QUIZ_SESSION_STORAGE_KEY);

  if (options?.clearGuestToken !== false) {
    clearQuizGuestToken();
  }

  clearQuizNavigationState(sessionId);
}

export function resolveQuizSessionId(explicitSessionId?: string | null): string | null {
  const trimmedExplicit = explicitSessionId?.trim();
  if (trimmedExplicit) return trimmedExplicit;

  if (typeof window === "undefined") return null;

  const fromSessionStorage = sessionStorage.getItem(QUIZ_SESSION_STORAGE_KEY)?.trim();
  if (fromSessionStorage) return fromSessionStorage;

  const fromLocalStorage = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY)?.trim();
  if (fromLocalStorage) return fromLocalStorage;

  try {
    const raw =
      sessionStorage.getItem(QUIZ_SESSION_DATA_KEY) ||
      localStorage.getItem(QUIZ_SESSION_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { sessionId?: string };
      const parsedSessionId = parsed.sessionId?.trim();
      if (parsedSessionId) return parsedSessionId;
    }
  } catch {
    // Ignore malformed session cache.
  }

  return null;
}

/** Update cached session during an in-progress quiz without wiping navigation state. */
export function updateStoredQuizSession(session: QuizSessionData): void {
  const sessionId = session.sessionId;
  if (!sessionId) return;

  const sessionToStore = withStoredGuestToken(session);

  sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, sessionId);
  localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, sessionId);
  sessionStorage.setItem(QUIZ_SESSION_DATA_KEY, JSON.stringify(sessionToStore));
  syncQuizGuestAuth(sessionToStore);
}

export function persistQuizSession(
  session: QuizSessionData,
  options?: { resumeFromApi?: boolean }
): boolean {
  const sessionId = session.sessionId;
  if (!sessionId) return false;

  const preservedGuestToken =
    session.guestToken?.trim() || getQuizGuestToken() || undefined;

  clearQuizSessionCompleted();
  clearActiveQuizSession({ clearGuestToken: false });

  const sessionToStore = preservedGuestToken
    ? { ...session, guestToken: preservedGuestToken }
    : session;

  sessionStorage.setItem(QUIZ_SESSION_STORAGE_KEY, sessionId);
  localStorage.setItem(QUIZ_SESSION_STORAGE_KEY, sessionId);
  sessionStorage.setItem(QUIZ_SESSION_DATA_KEY, JSON.stringify(sessionToStore));
  syncQuizGuestAuth(sessionToStore);

  if (options?.resumeFromApi) {
    sessionStorage.setItem(QUIZ_RESUME_FROM_API_KEY, "true");
  } else {
    sessionStorage.removeItem(QUIZ_RESUME_FROM_API_KEY);
  }

  return true;
}
