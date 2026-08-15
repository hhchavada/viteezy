import {
  collectApiErrorMessages,
  getApiErrorBody,
  getApiErrorFromUnknown,
} from "@/lib/apiError";
import { QUIZ_SAVE_PROGRESS_KEY } from "@/components/quiz/questions/constants";

export function isAccessTokenRequiredError(error: unknown): boolean {
  const body = getApiErrorBody(error);
  if (!body) return false;

  if (body.errorType === "AuthenticationError") return true;

  return collectApiErrorMessages(body).some((message) =>
    /access token is required/i.test(message)
  );
}

export function getQuizSavedEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(QUIZ_SAVE_PROGRESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { email?: string };
    const email = parsed.email?.trim();
    return email || null;
  } catch {
    return null;
  }
}

export function getQuizMagicLinkAccessMessage(email?: string | null): string {
  const trimmedEmail = email?.trim();

  if (trimmedEmail) {
    return `We've sent a magic link to ${trimmedEmail}. Check your inbox (or spam) and use it to sign in.`;
  }

  return `We've sent a magic link to your email address. Check your inbox (or spam) and use it to sign in.`;
}

export function resolveQuizRecommendationError(
  error: unknown,
  fallback: string,
  email?: string | null
): { requiresMagicLinkSignIn: boolean; message: string } {
  if (isAccessTokenRequiredError(error)) {
    return {
      requiresMagicLinkSignIn: true,
      message: getQuizMagicLinkAccessMessage(email ?? getQuizSavedEmail()),
    };
  }

  return {
    requiresMagicLinkSignIn: false,
    message: getApiErrorFromUnknown(error, { fallback }),
  };
}
