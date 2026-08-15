import type { QuizSessionData } from "@/store/api/types/healthQuiz.types";
import { QUIZ_COMPLETED_GUEST_TOKEN_KEY } from "@/components/quiz/questions/constants";
import { hasAuthToken } from "@/lib/utils";

const QUIZ_GUEST_TOKEN_KEY = "healthQuizGuestToken";

export function getQuizGuestToken(): string | null {
  if (typeof window === "undefined") return null;

  const fromSession = sessionStorage.getItem(QUIZ_GUEST_TOKEN_KEY)?.trim();
  if (fromSession) return fromSession;

  const fromLocal = localStorage.getItem(QUIZ_GUEST_TOKEN_KEY)?.trim();
  if (fromLocal) return fromLocal;

  const fromCompleted = localStorage
    .getItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY)
    ?.trim();
  return fromCompleted || null;
}

/** Auth headers for quiz API: Bearer token when logged in, x-guest-token for guests. */
export function getQuizAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  if (hasAuthToken()) {
    const token = localStorage.getItem("accessToken");
    return token ? { authorization: `Bearer ${token}` } : {};
  }

  const guestToken = getQuizGuestToken();
  return guestToken ? { "x-guest-token": guestToken } : {};
}

export function setQuizGuestToken(token: string) {
  if (typeof window === "undefined") return;

  const trimmed = token.trim();
  if (!trimmed) return;

  sessionStorage.setItem(QUIZ_GUEST_TOKEN_KEY, trimmed);
  localStorage.setItem(QUIZ_GUEST_TOKEN_KEY, trimmed);
}

export function clearQuizGuestToken() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(QUIZ_GUEST_TOKEN_KEY);
  localStorage.removeItem(QUIZ_GUEST_TOKEN_KEY);
  localStorage.removeItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY);
}

export function persistCompletedQuizGuestToken(token: string) {
  if (typeof window === "undefined") return;

  const trimmed = token.trim();
  if (!trimmed) return;

  setQuizGuestToken(trimmed);
  localStorage.setItem(QUIZ_COMPLETED_GUEST_TOKEN_KEY, trimmed);
}

/** Persist guest token for anonymous quiz sessions; clear it when user is logged in. */
export function syncQuizGuestAuth(session?: { guestToken?: string } | null) {
  if (typeof window === "undefined") return;

  if (hasAuthToken()) {
    clearQuizGuestToken();
    return;
  }

  const token = session?.guestToken?.trim() || getQuizGuestToken();
  if (token) {
    setQuizGuestToken(token);
  }
}

export function withStoredGuestToken(session: QuizSessionData): QuizSessionData {
  const guestToken = session.guestToken?.trim() || getQuizGuestToken() || undefined;
  return guestToken ? { ...session, guestToken } : session;
}
