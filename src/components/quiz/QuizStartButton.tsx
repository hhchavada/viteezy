"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  QUIZ_API_BASE_URL,
  useCreateQuizSessionMutation,
  useLazyGetActiveQuizSessionQuery,
} from "@/store/api/healthQuizApi";
import type { QuizSessionData } from "@/store/api/types/healthQuiz.types";
import { withStoredGuestToken } from "@/lib/quizGuestToken";
import {
  persistPendingRecommendationFromActiveSession,
  persistQuizSession,
} from "./questions/quizSessionStorage";
import ContinueQuizModal from "./ContinueQuizModal";
import type { QuizMessageTranslator } from "./questions/quizI18n";
import {
  clearSubscriptionQuizChangeContext,
  isSubscriptionChangeQuiz,
  syncSubscriptionQuizContextFromSearchParams,
} from "@/lib/subscriptionQuizContext";

type RtkQueryError = {
  status?: number | string;
  data?: { message?: string; error?: string };
  error?: string;
  message?: string;
};

function getQuizSessionErrorMessage(
  error: unknown,
  t: QuizMessageTranslator
): string {
  if (!error || typeof error !== "object") {
    return t("startFailed");
  }

  const err = error as RtkQueryError;

  if (err.data?.message) return err.data.message;
  if (err.data?.error) return err.data.error;
  if (typeof err.error === "string") return err.error;
  if (err.message) return err.message;
  if (err.status === "FETCH_ERROR") {
    return t("startNetworkError");
  }
  if (typeof err.status === "number") {
    return t("startRequestFailed", { status: err.status });
  }

  return t("startFailed");
}

function shouldStartFreshAfterActiveSessionLookup(error: unknown): boolean {
  const status = (error as RtkQueryError)?.status;
  return status === 404 || status === 401;
}

export default function QuizStartButton({ ctaLabel }: { ctaLabel?: string }) {
  const router = useRouter();
  const tQuiz = useTranslations("Quiz");
  const [getActiveQuizSession] = useLazyGetActiveQuizSessionQuery();
  const [createQuizSession] = useCreateQuizSessionMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const [savedSession, setSavedSession] = useState<QuizSessionData | null>(
    null
  );
  const [resumeSavedSessionFromApi, setResumeSavedSessionFromApi] =
    useState(false);

  const buttonLabel = ctaLabel?.trim() || tQuiz("startCta");
  const isMainButtonLoading = isFlowLoading && !isContinueModalOpen;
  const isStartingNewFromModal = isFlowLoading && isContinueModalOpen;

  const navigateToQuestions = useCallback(() => {
    router.replace("/quiz/questions");
  }, [router]);

  const navigateToRecommendations = useCallback(() => {
    router.replace("/recommendation");
  }, [router]);

  const openContinueModal = useCallback(
    (session: QuizSessionData, resumeFromApi: boolean) => {
      setSavedSession(session);
      setResumeSavedSessionFromApi(resumeFromApi);
      setIsContinueModalOpen(true);
      setIsFlowLoading(false);
    },
    []
  );

  const startNewQuiz = useCallback(async () => {
    setIsFlowLoading(true);
    setErrorMessage(null);

    const requestUrl = `${QUIZ_API_BASE_URL}/quiz/session`;
    console.info("Creating quiz session:", requestUrl);

    try {
      const response = await createQuizSession().unwrap();
      const session = response?.data;

      if (!session?.sessionId) {
        setErrorMessage(tQuiz("startFailed"));
        setIsFlowLoading(false);
        return;
      }

      if (!persistQuizSession(session)) {
        setErrorMessage(tQuiz("startFailed"));
        setIsFlowLoading(false);
        return;
      }

      setIsContinueModalOpen(false);
      setSavedSession(null);
      setResumeSavedSessionFromApi(false);
      setIsFlowLoading(false);
      navigateToQuestions();
    } catch (error) {
      const message = getQuizSessionErrorMessage(error, tQuiz);
      const err = error as RtkQueryError;

      console.error("Failed to create quiz session:", {
        message,
        status: err?.status,
        data: err?.data,
        requestUrl,
      });
      setErrorMessage(message);
      setIsFlowLoading(false);
    }
  }, [createQuizSession, navigateToQuestions, tQuiz]);

  const handleStartQuiz = useCallback(async () => {
    setErrorMessage(null);
    setIsFlowLoading(true);

    // Keep subscription-change context only when entry was Take the Quiz.
    // Normal /quiz starts clear it so the existing recommendation flow stays unchanged.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const synced = syncSubscriptionQuizContextFromSearchParams(params);
      if (!synced) {
        clearSubscriptionQuizChangeContext();
      }
    }

    const forceFreshForSubscriptionChange = isSubscriptionChangeQuiz();
    if (forceFreshForSubscriptionChange) {
      await startNewQuiz();
      return;
    }

    const requestUrl = `${QUIZ_API_BASE_URL}/quiz/session/active`;
    console.info("Fetching active quiz session:", requestUrl);

    try {
      const response = await getActiveQuizSession().unwrap();
      const {
        hasSavedSession,
        savedSession: activeSavedSession,
        pendingRecommendationId,
        pendingSessionId,
      } = response.data ?? {};

      const pendingRecommendation = pendingRecommendationId?.trim();
      if (pendingRecommendation) {
        const sessionId = pendingSessionId?.trim();
        if (!sessionId) {
          setErrorMessage(tQuiz("savedSessionNotFound"));
          setIsFlowLoading(false);
          return;
        }
        persistPendingRecommendationFromActiveSession({
          sessionId,
          recommendationId: pendingRecommendation,
        });
        setIsFlowLoading(false);
        navigateToRecommendations();
        return;
      }

      if (hasSavedSession && activeSavedSession?.sessionId) {
        openContinueModal(withStoredGuestToken(activeSavedSession), true);
        return;
      }

      await startNewQuiz();
    } catch (error) {
      if (shouldStartFreshAfterActiveSessionLookup(error)) {
        await startNewQuiz();
        return;
      }

      const message = getQuizSessionErrorMessage(error, tQuiz);
      const err = error as RtkQueryError;

      console.error("Failed to fetch active quiz session:", {
        message,
        status: err?.status,
        data: err?.data,
        requestUrl,
      });
      setErrorMessage(message);
      setIsFlowLoading(false);
    }
  }, [getActiveQuizSession, navigateToRecommendations, openContinueModal, startNewQuiz, tQuiz]);

  const handleContinueQuiz = useCallback(() => {
    if (!savedSession?.sessionId) {
      setErrorMessage(tQuiz("savedSessionNotFound"));
      return;
    }

    if (
      !persistQuizSession(savedSession, {
        resumeFromApi: resumeSavedSessionFromApi,
      })
    ) {
      setErrorMessage(tQuiz("resumeFailed"));
      return;
    }

    setIsContinueModalOpen(false);
    setSavedSession(null);
    setResumeSavedSessionFromApi(false);
    navigateToQuestions();
  }, [navigateToQuestions, resumeSavedSessionFromApi, savedSession]);

  const handleCloseContinueModal = useCallback(() => {
    if (isFlowLoading) return;
    setIsContinueModalOpen(false);
    setSavedSession(null);
    setResumeSavedSessionFromApi(false);
  }, [isFlowLoading]);

  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant="elevate"
        size="elevate"
        animateText
        className="mt-4 sm:mt-6 md:mt-8"
        onClick={handleStartQuiz}
        disabled={isFlowLoading}
      >
        {isMainButtonLoading ? tQuiz("starting") : buttonLabel}
      </Button>
      {errorMessage && (
        <p className="mt-3 max-w-md font-saans text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <ContinueQuizModal
        isOpen={isContinueModalOpen}
        isStartingNew={isStartingNewFromModal}
        onClose={handleCloseContinueModal}
        onContinue={handleContinueQuiz}
        onStartNew={startNewQuiz}
      />
    </div>
  );
}
