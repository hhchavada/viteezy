"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuizHeader from "@/components/quiz/QuizHeader";
import BouncingDotsLoader from "@/components/quiz/BouncingDotsLoader";
import QuizLoadingState from "@/components/quiz/QuizLoadingState";
import { Button } from "@/components/ui/button";
import {
  useLazyGetGoalsQuery,
  useLazyGetQuizSessionAnswersQuery,
  useLazyGetQuizSessionQuery,
  useSaveQuizSessionMutation,
  useDiscardQuizSessionMutation,
  useSubmitQuizAnswerMutation,
} from "@/store/api/healthQuizApi";
import type {
  QuizQuestion,
  QuizSessionData,
  SubmitQuizAnswerRequest,
} from "@/store/api/types/healthQuiz.types";
import QuizQuestionView, {
  QuizQuestionHeading,
} from "./questions/QuizQuestionView";
import QuizInfoPageView from "./questions/QuizInfoPageView";
import QuizGoalSelection, {
  QuizGoalSelectionHeading,
} from "./questions/QuizGoalSelection";
import {
  DEFAULT_INFO_PAGE_DURATION_SECONDS,
  DEFAULT_QUIZ_BACKGROUND,
  QUIZ_SESSION_DATA_KEY,
  QUIZ_SESSION_STORAGE_KEY,
} from "./questions/constants";
import {
  markQuizSessionCompleted,
  clearActiveQuizSession,
  clearQuizSessionCompleted,
  getCompletedQuizSessionId,
  isQuizSessionCompleted,
  resolveQuizSessionId,
  updateStoredQuizSession,
} from "./questions/quizSessionStorage";
import {
  GOALS_STEP_ID,
  advanceFromInfoPage,
  advanceNavigationFromApi,
  buildNavigationFromSessionAnswers,
  buildSessionDataFromAnswers,
  consumeResumeFromApiFlag,
  initNavigationFromSession,
  isGoalSelectionStep as isNavGoalStep,
  isInfoPageStep,
  mergeNavigationAfterSubmit,
  resolveInfoPagesFromSession,
  resolvePendingQuestionRefAfterInfoPages,
  resolveQuestionAfterInfoPages,
  resolveQuestionFromApiSession,
  resolveNextQuestionFromSubmitResponse,
  saveQuizNavigationState,
  type QuizNavigationState,
  type QuizStoredAnswer,
} from "./questions/quizNavigationStorage";
import {
  buildStoredAnswerFromQuestion,
  buildStoredGoalAnswer,
  getAnswerFormStateFromStored,
} from "./questions/quizNavigationHelpers";
import {
  getQuestionBackgroundUrls,
  getInfoPageBackgroundUrl,
  getInfoPageBackgroundUrls,
  getInfoPageFallbackBackgroundStyle,
  hasInfoPageBackgroundImage,
  isAnswerComplete,
  isManualSubmitQuestion,
  isQuestionSkipped,
} from "./questions/utils";
import { parseDateValue, resolveDatePickerConfig, validateDateAnswer } from "./questions/dateValidation";
import { validateGeneralTextAnswer } from "./questions/generalQuestionValidation";
import type { QuizMessageTranslator } from "./questions/quizI18n";
import {
  isGeneralQuestionFieldLocked,
  resolveGeneralQuestionTextState,
  resolveLoggedInQuizContact,
} from "./questions/quizLoggedInContact";
import { hasAuthToken } from "@/lib/utils";
import { useGetUserMeQuery } from "@/store/api/userApi";
import { routes } from "@/components/constants/route";
import { withStoredGuestToken, syncQuizGuestAuth } from "@/lib/quizGuestToken";
import SavePlanModal, {
  persistQuizSaveProgress,
  type QuizSaveProgressForm,
} from "./SavePlanModal";
import { useQuizLeaveGuard } from "./useQuizLeaveGuard";
import { shouldShowQuizLeaveGuard, countNavQuestionAnswers } from "./questions/quizLeaveGuardUtils";

const MAX_GOAL_SELECTION = 6;

function persistSession(session: QuizSessionData) {
  updateStoredQuizSession(session);
}

function isGoalSelectionStep(session: QuizSessionData): boolean {
  return Boolean(
    session.isGoalSelectionRequired && session.nextCategory === "goal"
  );
}

function hasQuizProgressRemaining(session: QuizSessionData): boolean {
  const progress = session.progress;
  return Boolean(
    progress && progress.total > 0 && progress.answered < progress.total
  );
}

function shouldCompleteQuizAfterAnswer(
  responseData: QuizSessionData,
  wasOnLastQuestion: boolean
): boolean {
  if (responseData.isComplete || responseData.status === "COMPLETED") {
    return true;
  }

  if (hasQuizProgressRemaining(responseData)) {
    return false;
  }

  if (
    isGoalSelectionStep(responseData) ||
    responseData.infoPage ||
    responseData.infoPages?.length ||
    responseData.nextQuestion
  ) {
    return false;
  }

  if (responseData.isLastQuestion && responseData.lastQuestion) {
    return false;
  }

  return wasOnLastQuestion;
}

function buildGoalStepSession(
  session: QuizSessionData,
  sessionId: string
): QuizSessionData {
  return {
    ...session,
    sessionId,
    currentQuestion: undefined,
    nextQuestion: undefined,
    firstQuestion: undefined,
    questions: [],
    isGoalSelectionRequired: true,
    nextCategory: "goal",
  };
}

function buildSubmitPayload(
  question: QuizQuestion,
  sessionId: string,
  selectionOrder: string[],
  textValue: string,
  t?: QuizMessageTranslator
): SubmitQuizAnswerRequest {
  const base = { sessionId, questionId: question._id };

  if (question.answerType === "answer") {
    const selectedOptionIds = selectionOrder
      .map((value) => question.options.find((o) => o.value === value)?._id)
      .filter((id): id is string => Boolean(id));

    return { ...base, selectedOptionIds };
  }

  if (question.answerType === "text") {
    const validation = validateGeneralTextAnswer(question, textValue, t);
    return {
      ...base,
      textAnswer: validation.normalized ?? textValue.trim(),
    };
  }

  const dateResult = validateDateAnswer(question, textValue, t);
  return { ...base, dateAnswer: dateResult.normalized ?? textValue.trim() };
}

function normalizeSessionData(
  session: QuizSessionData,
  fallbackSessionId?: string | null
): QuizSessionData {
  const resolvedSessionId = session.sessionId ?? fallbackSessionId ?? undefined;

  if (isGoalSelectionStep(session)) {
    return buildGoalStepSession(session, resolvedSessionId ?? "");
  }

  const resolvedQuestion = resolveInfoPagesFromSession(session).length
    ? undefined
    : resolveQuestionFromApiSession(session);

  return {
    ...withStoredGuestToken(session),
    sessionId: resolvedSessionId,
    currentQuestion: resolvedQuestion,
    status: session.status ?? (session.isComplete ? "COMPLETED" : "IN_PROGRESS"),
  };
}

function resolveSessionId(
  session: QuizSessionData,
  fallbackSessionId?: string | null
): string | undefined {
  return session.sessionId ?? fallbackSessionId ?? undefined;
}

function hasResolvableQuizStep(session: QuizSessionData): boolean {
  const normalized = normalizeSessionData(session, session.sessionId);
  return Boolean(
    normalized.sessionId &&
      (isGoalSelectionStep(normalized) ||
        resolveInfoPagesFromSession(normalized).length > 0 ||
        normalized.currentQuestion)
  );
}

function getSessionId(session: QuizSessionData | null): string | null {
  return resolveQuizSessionId(session?.sessionId ?? null);
}

export default function QuizQuestions() {
  const router = useRouter();
  const tQuiz = useTranslations("Quiz");
  const tCommon = useTranslations("Common");
  const [sessionData, setSessionData] = useState<QuizSessionData | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionBackgrounds, setQuestionBackgrounds] = useState({
    desktop: DEFAULT_QUIZ_BACKGROUND,
    mobile: DEFAULT_QUIZ_BACKGROUND,
  });
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [isCompletingQuiz, setIsCompletingQuiz] = useState(false);
  const [leaveActionError, setLeaveActionError] = useState<string | null>(null);
  const [navState, setNavState] = useState<QuizNavigationState | null>(null);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [submitAnswer, { isLoading: isSubmitting }] =
    useSubmitQuizAnswerMutation();
  const [saveQuizSession, { isLoading: isSavingProgress }] =
    useSaveQuizSessionMutation();
  const [discardQuizSession, { isLoading: isDiscardingProgress }] =
    useDiscardQuizSessionMutation();

  const isGoalMode = sessionData ? isGoalSelectionStep(sessionData) : false;

  const [fetchGoals, { data: goalsResponse, isFetching: isGoalsFetching, isError: isGoalsError }] =
    useLazyGetGoalsQuery();
  const [fetchQuizSession] = useLazyGetQuizSessionQuery();
  const [fetchQuizSessionAnswers] = useLazyGetQuizSessionAnswersQuery();

  const isLoggedIn = hasAuthToken();
  const { data: userMeData } = useGetUserMeQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });

  const loggedInContact = useMemo(
    () => resolveLoggedInQuizContact(userMeData?.data?.user),
    [userMeData]
  );

  const goals = goalsResponse?.data?.goals ?? [];

  const currentVisitedId = navState?.visitedQuestionIds[historyIndex] ?? null;
  const isViewingGoals = currentVisitedId === GOALS_STEP_ID;
  const isViewingInfoPage = isInfoPageStep(currentVisitedId);
  const isLiveStep =
    Boolean(navState?.currentQuestionId) &&
    currentVisitedId === navState?.currentQuestionId;
  const isReAnswerMode = Boolean(
    navState?.currentQuestionId &&
      currentVisitedId &&
      currentVisitedId !== navState.currentQuestionId
  );

  const displayQuestion = useMemo(() => {
    if (!navState || isViewingGoals || isViewingInfoPage) return null;

    const visitedId = navState.visitedQuestionIds[historyIndex];
    if (visitedId && navState.questionSnapshots[visitedId]) {
      return navState.questionSnapshots[visitedId];
    }

    if (sessionData && isLiveStep) {
      return resolveQuestionFromApiSession(sessionData) ?? null;
    }

    return sessionData?.currentQuestion ?? null;
  }, [
    navState,
    historyIndex,
    isViewingGoals,
    isViewingInfoPage,
    sessionData,
    isLiveStep,
  ]);

  const displayInfoPage = useMemo(() => {
    if (!navState || !isViewingInfoPage || !currentVisitedId) return null;
    return navState.infoPageSnapshots?.[currentVisitedId] ?? sessionData?.infoPage ?? null;
  }, [navState, isViewingInfoPage, currentVisitedId, sessionData?.infoPage]);

  const infoPageBackgrounds = useMemo(() => {
    if (!isViewingInfoPage || !displayInfoPage) return null;
    return getInfoPageBackgroundUrls(displayInfoPage);
  }, [isViewingInfoPage, displayInfoPage]);

  const showGoalMode = isViewingGoals || (isGoalMode && isLiveStep);
  const showInfoPageMode = isViewingInfoPage;
  const question = displayQuestion;
  const isGeneralFieldLocked = useMemo(
    () => isGeneralQuestionFieldLocked(question, isLoggedIn, loggedInContact),
    [question, isLoggedIn, loggedInContact]
  );
  const isLastQuestion =
    !showGoalMode && isLiveStep && sessionData?.isLastQuestion === true;

  const canGoBack = historyIndex > 0;

  const liveHistoryIndex = useMemo(() => {
    if (!navState?.currentQuestionId) return -1;
    return navState.visitedQuestionIds.indexOf(navState.currentQuestionId);
  }, [navState]);

  const canNavigateForwardInHistory = Boolean(
    navState && historyIndex < navState.visitedQuestionIds.length - 1
  );

  /** User went back to re-watch info pages already passed in the live flow. */
  const isInfoPageReviewMode = useMemo(
    () =>
      showInfoPageMode &&
      liveHistoryIndex >= 0 &&
      historyIndex < liveHistoryIndex,
    [showInfoPageMode, liveHistoryIndex, historyIndex]
  );

  const canGoForward = isInfoPageReviewMode
    ? canNavigateForwardInHistory
    : !showInfoPageMode && canNavigateForwardInHistory;

  const infoNavConfirmClicksRef = useRef({ back: 0, forward: 0 });

  useEffect(() => {
    infoNavConfirmClicksRef.current = { back: 0, forward: 0 };
  }, [currentVisitedId]);

  const shouldShowLeaveGuard = useMemo(() => {
    const navAnsweredCount = countNavQuestionAnswers(navState?.answers);

    return shouldShowQuizLeaveGuard(sessionData, {
      navAnsweredCount,
      answers: navState?.answers,
      questionSnapshots: navState?.questionSnapshots,
      navState,
    });
  }, [sessionData, navState]);

  const leaveGuardEnabled =
    Boolean(sessionData) &&
    !isSubmitting &&
    !isCompletingQuiz &&
    shouldShowLeaveGuard;

  const {
    isLeaveModalOpen,
    closeLeaveModal,
    proceedLeave,
    allowNavigation,
    requestLeave,
  } = useQuizLeaveGuard({
    enabled: leaveGuardEnabled,
  });

  const handleLogoClick = useCallback(() => {
    requestLeave("/");
  }, [requestLeave]);

  const handleCloseLeaveModal = useCallback(() => {
    setLeaveActionError(null);
    closeLeaveModal();
  }, [closeLeaveModal]);

  const getLeaveErrorMessage = useCallback((error: unknown) => {
    const err = error as { data?: { message?: string }; message?: string };
    return (
      err?.data?.message ||
      err?.message ||
      tQuiz("genericError")
    );
  }, [tQuiz]);

  const handleSaveProgress = useCallback(
    async (data: QuizSaveProgressForm) => {
      const sessionId = getSessionId(sessionData);
      if (!sessionId) {
        setLeaveActionError(tQuiz("sessionNotFound"));
        return;
      }

      setLeaveActionError(null);

      try {
        await saveQuizSession({
          sessionId,
          name: data.name,
          email: data.email,
          marketingConsent: data.marketingConsent,
          whatsappConsent: data.whatsappConsent,
        }).unwrap();

        persistQuizSaveProgress(data);
        clearActiveQuizSession();
        proceedLeave();
      } catch (error) {
        setLeaveActionError(getLeaveErrorMessage(error));
      }
    },
    [
      sessionData,
      saveQuizSession,
      proceedLeave,
      getLeaveErrorMessage,
    ]
  );

  const handleDiscardProgress = useCallback(async () => {
    const sessionId = getSessionId(sessionData);
    setLeaveActionError(null);

    try {
      if (sessionId) {
        await discardQuizSession(sessionId).unwrap();
      }

      clearActiveQuizSession();
      proceedLeave({ forceLanding: true });
    } catch (error) {
      setLeaveActionError(getLeaveErrorMessage(error));
    }
  }, [
    sessionData,
    discardQuizSession,
    proceedLeave,
    getLeaveErrorMessage,
  ]);

  const navigateAway = useCallback(
    (path: string) => {
      allowNavigation();
      router.replace(path);
    },
    [allowNavigation, router]
  );

  const completeQuizAndNavigate = useCallback(
    (sessionId: string) => {
      setIsCompletingQuiz(true);
      allowNavigation();
      markQuizSessionCompleted(sessionId);
      router.replace(routes.recommendation);
    },
    [allowNavigation, router]
  );

  const loadGoals = useCallback(async () => {
    try {
      await fetchGoals().unwrap();
      setGoalsLoaded(true);
    } catch {
      setGoalsLoaded(true);
    }
  }, [fetchGoals]);

  const applyFormFromNavigation = useCallback(
    (state: QuizNavigationState, index: number) => {
      const visitedId = state.visitedQuestionIds[index];
      if (!visitedId) return;

      setErrorMessage(null);

      if (visitedId === GOALS_STEP_ID) {
        const form = getAnswerFormStateFromStored(
          state.answers[GOALS_STEP_ID],
          true
        );
        setSelectedGoalIds(form.selectedGoalIds);
        setSelectedValues([]);
        setSelectionOrder([]);
        setTextValue("");
        setQuestionBackgrounds({
          desktop: DEFAULT_QUIZ_BACKGROUND,
          mobile: DEFAULT_QUIZ_BACKGROUND,
        });
        return;
      }

      if (isInfoPageStep(visitedId)) {
        const snapshot = state.infoPageSnapshots?.[visitedId];
        setSelectedGoalIds([]);
        setSelectedValues([]);
        setSelectionOrder([]);
        setTextValue("");
        return;
      }

      const snapshot = state.questionSnapshots[visitedId];
      if (!snapshot) return;

      const form = getAnswerFormStateFromStored(state.answers[visitedId], false);
      const resolvedText = resolveGeneralQuestionTextState(
        snapshot,
        form.textValue,
        loggedInContact,
        isLoggedIn
      );
      setSelectedValues(form.selectedValues);
      setSelectionOrder(form.selectionOrder);
      setSelectedGoalIds([]);
      setTextValue(resolvedText.textValue);
      setQuestionBackgrounds(getQuestionBackgroundUrls(snapshot));
    },
    [isLoggedIn, loggedInContact]
  );

  const handleBack = useCallback(() => {
    if (!navState || historyIndex <= 0) return;

    if (showInfoPageMode && isInfoPageReviewMode) {
      infoNavConfirmClicksRef.current.back += 1;
      if (infoNavConfirmClicksRef.current.back < 2) return;
      infoNavConfirmClicksRef.current = { back: 0, forward: 0 };
    }

    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    applyFormFromNavigation(navState, nextIndex);
  }, [navState, historyIndex, applyFormFromNavigation, showInfoPageMode, isInfoPageReviewMode]);

  const handleForward = useCallback(() => {
    if (!navState || historyIndex >= navState.visitedQuestionIds.length - 1) {
      return;
    }

    if (showInfoPageMode && isInfoPageReviewMode) {
      infoNavConfirmClicksRef.current.forward += 1;
      if (infoNavConfirmClicksRef.current.forward < 2) return;
      infoNavConfirmClicksRef.current = { back: 0, forward: 0 };
    }

    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    applyFormFromNavigation(navState, nextIndex);
  }, [navState, historyIndex, applyFormFromNavigation, showInfoPageMode, isInfoPageReviewMode]);

  const syncAfterSubmit = useCallback(
    (
      sessionId: string,
      apiSession: QuizSessionData,
      answeredStepId: string,
      storedAnswer: QuizStoredAnswer,
      questionSnapshot: QuizQuestion | undefined,
      isReAnswer: boolean,
      navigationState: QuizNavigationState,
      answeredStepIndex?: number
    ) => {
      const { state: updatedNav, historyIndex: nextIndex } =
        mergeNavigationAfterSubmit(
          navigationState,
          answeredStepId,
          storedAnswer,
          questionSnapshot,
          apiSession,
          isReAnswer,
          answeredStepIndex
        );

      saveQuizNavigationState(sessionId, updatedNav);
      setNavState(updatedNav);
      setHistoryIndex(nextIndex);

      const nextQuestion = resolveNextQuestionFromSubmitResponse(apiSession);

      const nextSession = normalizeSessionData(
        {
          ...apiSession,
          sessionId,
          currentQuestion: nextQuestion ?? apiSession.currentQuestion,
          isGoalSelectionRequired:
            apiSession.isGoalSelectionRequired ?? false,
          isLastQuestion: apiSession.isLastQuestion ?? false,
        },
        sessionId
      );

      setSessionData(nextSession);
      persistSession(nextSession);
      applyFormFromNavigation(updatedNav, nextIndex);

      if (isNavGoalStep(nextSession)) {
        setGoalsLoaded(false);
        loadGoals();
      }
    },
    [applyFormFromNavigation, loadGoals]
  );

  const submitQuestionAnswer = useCallback(
    async (
      targetQuestion: QuizQuestion,
      order: string[],
      answerText: string
    ) => {
      if (!sessionData || !navState) return;

      const sessionId = getSessionId(sessionData);
      if (!sessionId) {
        navigateAway(routes.quiz);
        return;
      }

      setErrorMessage(null);

      const isSkipping = isQuestionSkipped(targetQuestion, order, answerText);

      if (!isSkipping) {
        if (targetQuestion.answerType === "text") {
          const validation = validateGeneralTextAnswer(
            targetQuestion,
            answerText,
            tQuiz
          );
          if (!validation.valid) {
            setErrorMessage(
              validation.error || tQuiz("invalidAnswer")
            );
            return;
          }
        }

        if (targetQuestion.answerType === "date_picker") {
          const validation = validateDateAnswer(targetQuestion, answerText, tQuiz);
          if (!validation.valid) {
            setErrorMessage(validation.error || tQuiz("invalidDate"));
            return;
          }
        }
      }

      const payload = buildSubmitPayload(
        targetQuestion,
        sessionId,
        isSkipping ? [] : order,
        isSkipping ? "" : answerText,
        tQuiz
      );

      const storedAnswer = buildStoredAnswerFromQuestion(
        targetQuestion,
        isSkipping ? [] : order,
        isSkipping ? "" : answerText
      );

      const response = await submitAnswer(payload).unwrap();
      const responseData = response.data as QuizSessionData;

      const onLastQuestion =
        !showGoalMode && isLiveStep && sessionData?.isLastQuestion === true;

      if (
        shouldCompleteQuizAfterAnswer(
          responseData,
          isReAnswerMode ? false : onLastQuestion
        )
      ) {
        const { state: updatedNav } = mergeNavigationAfterSubmit(
          navState,
          targetQuestion._id,
          storedAnswer,
          targetQuestion,
          responseData,
          isReAnswerMode,
          isReAnswerMode ? historyIndex : undefined
        );
        saveQuizNavigationState(sessionId, updatedNav);
        setNavState(updatedNav);
        completeQuizAndNavigate(sessionId);
        return;
      }

      syncAfterSubmit(
        sessionId,
        responseData,
        targetQuestion._id,
        storedAnswer,
        targetQuestion,
        isReAnswerMode,
        navState,
        isReAnswerMode ? historyIndex : undefined
      );
    },
    [
      sessionData,
      navState,
      historyIndex,
      showGoalMode,
      isLiveStep,
      isReAnswerMode,
      submitAnswer,
      syncAfterSubmit,
      completeQuizAndNavigate,
      navigateAway,
    ]
  );

  useEffect(() => {
    if (!showGoalMode) {
      setGoalsLoaded(false);
      return;
    }

    if (!goalsLoaded && !isGoalsFetching) {
      loadGoals();
    }
  }, [showGoalMode, goalsLoaded, isGoalsFetching, loadGoals]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const raw = sessionStorage.getItem(QUIZ_SESSION_DATA_KEY);
      const completedSessionId = getCompletedQuizSessionId();

      if (!raw) {
        if (isQuizSessionCompleted()) {
          navigateAway(routes.recommendation);
          return;
        }
        navigateAway(routes.quiz);
        return;
      }

      try {
        let parsed = withStoredGuestToken(
          JSON.parse(raw) as QuizSessionData
        );
        syncQuizGuestAuth(parsed);
        const fallbackSessionId = localStorage.getItem(QUIZ_SESSION_STORAGE_KEY);
        const activeSessionId = resolveSessionId(parsed, fallbackSessionId);

        if (
          activeSessionId &&
          completedSessionId &&
          activeSessionId !== completedSessionId
        ) {
          clearQuizSessionCompleted();
        }

        if (
          isQuizSessionCompleted() &&
          completedSessionId &&
          activeSessionId === completedSessionId
        ) {
          navigateAway(routes.recommendation);
          return;
        }

        let session = normalizeSessionData(parsed, fallbackSessionId);
        const sessionId =
          session.sessionId ?? fallbackSessionId ?? undefined;
        const resumeFromApi = sessionId ? consumeResumeFromApiFlag() : false;

        let navStateResult: {
          state: QuizNavigationState;
          historyIndex: number;
        } | null = null;

        if (resumeFromApi && sessionId) {
          try {
            const answersResponse = await fetchQuizSessionAnswers(
              sessionId
            ).unwrap();
            const answersData = answersResponse.data;

            session = normalizeSessionData(
              buildSessionDataFromAnswers(answersData, session),
              sessionId
            );

            const restored = buildNavigationFromSessionAnswers(answersData);
            saveQuizNavigationState(sessionId, restored.state);
            navStateResult = {
              state: restored.state,
              historyIndex: restored.historyIndex,
            };
          } catch {
            navStateResult = null;
          }
        }

        if (!navStateResult) {
          if (session.sessionId && !hasResolvableQuizStep(session)) {
            const fullResponse = await fetchQuizSession(session.sessionId).unwrap();
            parsed = fullResponse.data;
            session = normalizeSessionData(parsed, session.sessionId);
          }
        }

        const isSameCompletedSession =
          Boolean(session.sessionId) &&
          Boolean(completedSessionId) &&
          session.sessionId === completedSessionId;

        if (
          (parsed.isComplete || parsed.status === "COMPLETED") &&
          isSameCompletedSession
        ) {
          markQuizSessionCompleted(session.sessionId);
          navigateAway(routes.recommendation);
          return;
        }

        if (!hasResolvableQuizStep(session)) {
          if (!cancelled) navigateAway(routes.quiz);
          return;
        }

        if (!navStateResult) {
          const fallback = initNavigationFromSession(session);
          navStateResult = {
            state: fallback.state,
            historyIndex: fallback.index,
          };
        }

        if (!cancelled) {
          setSessionData(session);
          setNavState(navStateResult.state);
          setHistoryIndex(navStateResult.historyIndex);
          applyFormFromNavigation(
            navStateResult.state,
            navStateResult.historyIndex
          );
        }
      } catch {
        if (!cancelled) {
          navigateAway(routes.quiz);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [fetchQuizSession, fetchQuizSessionAnswers, navigateAway, applyFormFromNavigation]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted && isQuizSessionCompleted()) {
        navigateAway(routes.recommendation);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [navigateAway]);

  useEffect(() => {
    const urls = [questionBackgrounds.desktop, questionBackgrounds.mobile];

    urls.forEach((url) => {
      if (!url) return;

      const image = new window.Image();
      image.src = url;
      image.onerror = () =>
        setQuestionBackgrounds({
          desktop: DEFAULT_QUIZ_BACKGROUND,
          mobile: DEFAULT_QUIZ_BACKGROUND,
        });
    });
  }, [questionBackgrounds]);

  const progress = sessionData?.progress?.percentage ?? 0;

  const canSubmitQuestion = useMemo(() => {
    if (!question) return false;
    return isAnswerComplete(question, selectedValues, textValue);
  }, [question, selectedValues, textValue]);

  const canSubmitGoals = selectedGoalIds.length >= 1;

  const handleTextChange = useCallback(
    (value: string) => {
      if (isGeneralFieldLocked) return;
      setTextValue(value);
      setErrorMessage(null);
    },
    [isGeneralFieldLocked]
  );

  useEffect(() => {
    if (!question || !isLoggedIn) return;

    const resolvedText = resolveGeneralQuestionTextState(
      question,
      textValue,
      loggedInContact,
      isLoggedIn
    );

    if (resolvedText.locked) {
      setTextValue((current) =>
        current === resolvedText.textValue ? current : resolvedText.textValue
      );
    }
  }, [question, question?._id, isLoggedIn, loggedInContact, textValue]);

  const textAnswerError = useMemo(() => {
    if (!question || question.answerType !== "text") return null;

    if (errorMessage) return errorMessage;

    const trimmed = textValue.trim();
    if (!trimmed) return null;

    const validation = validateGeneralTextAnswer(question, textValue, tQuiz);
    if (!validation.valid && validation.error) {
      return validation.error;
    }

    return null;
  }, [question, textValue, errorMessage, tQuiz]);

  const dateAnswerError = useMemo(() => {
    if (!question || question.answerType !== "date_picker") return null;

    if (errorMessage) return errorMessage;

    const parts = parseDateValue(
      textValue,
      resolveDatePickerConfig(question)
    );
    const hasAnyInput = Boolean(parts.year || parts.month || parts.day);
    if (!hasAnyInput) return null;

    const validation = validateDateAnswer(question, textValue, tQuiz);
    if (!validation.valid && validation.error) {
      return validation.error;
    }

    return null;
  }, [question, textValue, errorMessage, tQuiz]);

  const handleSelectValue = useCallback(
    (value: string) => {
      if (!question || question.answerType !== "answer" || isSubmitting) return;

      if (question.answerSelection === "multiple") {
        const max = question.maxSelection ?? question.options.length;

        if (selectedValues.includes(value)) {
          setSelectedValues((prev) => prev.filter((item) => item !== value));
          setSelectionOrder((prev) => prev.filter((item) => item !== value));
          return;
        }

        if (selectedValues.length >= max) return;

        const nextOrder = [...selectionOrder, value];
        const nextValues = [...selectedValues, value];

        setSelectedValues(nextValues);
        setSelectionOrder(nextOrder);

        if (nextOrder.length >= max) {
          void (async () => {
            try {
              await submitQuestionAnswer(question, nextOrder, textValue);
            } catch (error) {
              const err = error as {
                data?: { message?: string };
                message?: string;
              };
              setErrorMessage(
                err?.data?.message ||
                  err?.message ||
                  tQuiz("submitAnswerFailed")
              );
            }
          })();
        }

        return;
      }

      if (selectedValues.length === 1 && selectedValues[0] === value && !isReAnswerMode) {
        return;
      }

      setSelectedValues([value]);
      setSelectionOrder([value]);

      void (async () => {
        try {
          await submitQuestionAnswer(question, [value], textValue);
        } catch (error) {
          const err = error as { data?: { message?: string }; message?: string };
          setErrorMessage(
            err?.data?.message ||
              err?.message ||
              tQuiz("submitAnswerFailed")
          );
        }
      })();
    },
    [
      question,
      isSubmitting,
      isReAnswerMode,
      selectedValues,
      selectionOrder,
      textValue,
      submitQuestionAnswer,
    ]
  );

  const handleToggleGoal = useCallback((goalId: string) => {
    setSelectedGoalIds((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((id) => id !== goalId);
      }
      if (prev.length >= MAX_GOAL_SELECTION) return prev;
      return [...prev, goalId];
    });
  }, []);

  const advanceInfoPageStep = useCallback(() => {
    if (!sessionData || !navState) return;

    const sessionId = getSessionId(sessionData);
    if (!sessionId) {
      navigateAway(routes.quiz);
      return;
    }

    const nextVisitedId = navState.visitedQuestionIds[historyIndex + 1];

    if (nextVisitedId) {
      const nextIndex = historyIndex + 1;

      if (isInfoPageStep(nextVisitedId)) {
        const updatedNav = {
          ...navState,
          currentQuestionId: nextVisitedId,
        };
        const nextInfoPage = updatedNav.infoPageSnapshots?.[nextVisitedId];

        saveQuizNavigationState(sessionId, updatedNav);
        setNavState(updatedNav);
        setHistoryIndex(nextIndex);

        const nextSession = normalizeSessionData(
          {
            ...sessionData,
            sessionId,
            infoPage: nextInfoPage ?? null,
            infoPages: undefined,
            currentQuestion: undefined,
          },
          sessionId
        );

        setSessionData(nextSession);
        persistSession(nextSession);
        applyFormFromNavigation(updatedNav, nextIndex);
        return;
      }

      if (navState.questionSnapshots[nextVisitedId]) {
        const nextQuestion = navState.questionSnapshots[nextVisitedId];

        const updatedNav = {
          ...navState,
          currentQuestionId: nextQuestion._id,
        };

        saveQuizNavigationState(sessionId, updatedNav);
        setNavState(updatedNav);
        setHistoryIndex(nextIndex);

        const nextSession = normalizeSessionData(
          {
            ...sessionData,
            sessionId,
            infoPage: null,
            infoPages: undefined,
            currentQuestion: nextQuestion,
          },
          sessionId
        );

        setSessionData(nextSession);
        persistSession(nextSession);
        applyFormFromNavigation(updatedNav, nextIndex);
        return;
      }
    }

    setErrorMessage(null);

    const resumeSession: QuizSessionData = {
      ...(navState.postInfoResumeSession ?? sessionData),
      sessionId,
      infoPage: null,
      infoPages: undefined,
    };

    const pendingRef =
      navState.pendingQuestionRef ??
      resolvePendingQuestionRefAfterInfoPages(resumeSession);

    const cachedQuestion =
      pendingRef && navState.questionSnapshots[pendingRef]
        ? navState.questionSnapshots[pendingRef]
        : undefined;

    const nextQuestion =
      resolveQuestionAfterInfoPages(resumeSession, pendingRef) ??
      sessionData.nextQuestion ??
      resumeSession.nextQuestion ??
      cachedQuestion;

    if (nextQuestion) {
      const { state: updatedNav, historyIndex: nextIndex } = advanceFromInfoPage(
        navState,
        nextQuestion
      );

      saveQuizNavigationState(sessionId, updatedNav);
      setNavState(updatedNav);
      setHistoryIndex(nextIndex);

      const nextSession = normalizeSessionData(
        {
          ...resumeSession,
          sessionId,
          infoPage: null,
          infoPages: undefined,
          nextQuestion: null,
          currentQuestion: nextQuestion,
          isLastQuestion: true,
          lastQuestion: nextQuestion,
        },
        sessionId
      );

      setSessionData(nextSession);
      persistSession(nextSession);
      applyFormFromNavigation(updatedNav, nextIndex);
      return;
    }

    if (isGoalSelectionStep(resumeSession)) {
      const { state: updatedNav, historyIndex: nextIndex } =
        advanceNavigationFromApi(navState, resumeSession);

      const nextSession = normalizeSessionData(
        buildGoalStepSession(resumeSession, sessionId),
        sessionId
      );

      saveQuizNavigationState(sessionId, updatedNav);
      setNavState(updatedNav);
      setHistoryIndex(nextIndex);
      setSessionData(nextSession);
      persistSession(nextSession);
      applyFormFromNavigation(updatedNav, nextIndex);
      return;
    }

    if (hasQuizProgressRemaining(resumeSession)) {
      setErrorMessage(tQuiz("nextQuestionNotFound"));
      return;
    }

    if (shouldCompleteQuizAfterAnswer(resumeSession, false)) {
      completeQuizAndNavigate(sessionId);
      return;
    }

    setErrorMessage(tQuiz("nextQuestionNotFound"));
  }, [
    sessionData,
    navState,
    historyIndex,
    navigateAway,
    applyFormFromNavigation,
    completeQuizAndNavigate,
  ]);

  const advanceInfoPageOnTimer = useCallback(() => {
    if (!navState || !showInfoPageMode) return;

    if (isInfoPageReviewMode) {
      if (historyIndex >= navState.visitedQuestionIds.length - 1) return;

      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      applyFormFromNavigation(navState, nextIndex);
      return;
    }

    void advanceInfoPageStep();
  }, [
    navState,
    showInfoPageMode,
    isInfoPageReviewMode,
    historyIndex,
    applyFormFromNavigation,
    advanceInfoPageStep,
  ]);

  useEffect(() => {
    if (!showInfoPageMode || !displayInfoPage || isSubmitting) {
      return;
    }

    const durationSeconds =
      typeof displayInfoPage.duration === "number" && displayInfoPage.duration > 0
        ? displayInfoPage.duration
        : DEFAULT_INFO_PAGE_DURATION_SECONDS;

    const timer = window.setTimeout(() => {
      advanceInfoPageOnTimer();
    }, durationSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [
    showInfoPageMode,
    displayInfoPage?._id,
    displayInfoPage?.duration,
    historyIndex,
    isSubmitting,
    advanceInfoPageOnTimer,
  ]);

  const handleNext = useCallback(async () => {
    if (!sessionData || !navState) return;

    const sessionId = getSessionId(sessionData);
    if (!sessionId) {
      navigateAway(routes.quiz);
      return;
    }

    setErrorMessage(null);

    try {
      if (showInfoPageMode) {
        await advanceInfoPageStep();
        return;
      }

      if (showGoalMode) {
        if (!canSubmitGoals) return;

        const storedAnswer = buildStoredGoalAnswer(selectedGoalIds);

        const response = await submitAnswer({
          sessionId,
          selectedGoals: selectedGoalIds,
        }).unwrap();

        const responseData = response.data as QuizSessionData;

        if (shouldCompleteQuizAfterAnswer(responseData, false)) {
          completeQuizAndNavigate(sessionId);
          return;
        }

        syncAfterSubmit(
          sessionId,
          responseData,
          GOALS_STEP_ID,
          storedAnswer,
          undefined,
          isReAnswerMode,
          navState,
          isReAnswerMode ? historyIndex : undefined
        );
        return;
      }

      if (!question) return;

      const isSkipping = isQuestionSkipped(question, selectionOrder, textValue);

      if (!canSubmitQuestion && !isSkipping) {
        if (question?.answerType === "text") {
          const validation = validateGeneralTextAnswer(question, textValue, tQuiz);
          if (!validation.valid && validation.error) {
            setErrorMessage(validation.error);
          }
        }

        if (question?.answerType === "date_picker") {
          const validation = validateDateAnswer(question, textValue, tQuiz);
          if (!validation.valid && validation.error) {
            setErrorMessage(validation.error);
          }
        }

        return;
      }

      try {
        await submitQuestionAnswer(
          question,
          isSkipping ? [] : selectionOrder,
          isSkipping ? "" : textValue
        );
      } catch (error) {
        const err = error as { data?: { message?: string }; message?: string };
        setErrorMessage(
          err?.data?.message ||
            err?.message ||
            tQuiz("submitAnswerFailed")
        );
      }
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      setErrorMessage(
        err?.data?.message ||
          err?.message ||
          (showGoalMode ? tQuiz("submitGoalsFailed") : tQuiz("submitAnswerFailed"))
      );
    }
  }, [
    sessionData,
    navState,
    showGoalMode,
    showInfoPageMode,
    isReAnswerMode,
    canSubmitGoals,
    selectedGoalIds,
    question,
    canSubmitQuestion,
    isLastQuestion,
    selectionOrder,
    textValue,
    submitQuestionAnswer,
    syncAfterSubmit,
    completeQuizAndNavigate,
    navigateAway,
    advanceInfoPageStep,
  ]);

  const isGoalsLoading = showGoalMode && (isGoalsFetching || !goalsLoaded);

  if (!sessionData) {
    return <QuizLoadingState message={tQuiz("loadingQuiz")} />;
  }

  if (showGoalMode && isGoalsLoading) {
    return <QuizLoadingState message={tQuiz("loadingGoals")} />;
  }

  if (showGoalMode && (isGoalsError || (goalsLoaded && goals.length === 0))) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3">
        <p className="font-saans text-base text-red-600">
          {tQuiz("loadGoalsFailed")}
        </p>
        <div className="flex gap-3">
          <Button variant="elevate" size="elevate" onClick={() => {
            setGoalsLoaded(false);
            loadGoals();
          }}>
            {tQuiz("retry")}
          </Button>
          <Button variant="elevate" size="elevate" onClick={() => navigateAway(routes.quiz)}>
            {tQuiz("backToQuiz")}
          </Button>
        </div>
      </div>
    );
  }

  if (showInfoPageMode && !displayInfoPage) {
    return <QuizLoadingState message={tQuiz("loadingInfoPage")} />;
  }

  if (!showGoalMode && !showInfoPageMode && !question) {
    return <QuizLoadingState message={tQuiz("loadingQuiz")} />;
  }

  const isSkippingCurrentQuestion = Boolean(
    question && isQuestionSkipped(question, selectedValues, textValue)
  );

  const canSubmit = showInfoPageMode
    ? Boolean(
        sessionData.nextQuestion ||
          (navState &&
            isInfoPageStep(currentVisitedId) &&
            navState.visitedQuestionIds[historyIndex + 1] &&
            !isInfoPageStep(navState.visitedQuestionIds[historyIndex + 1]))
      )
    : showGoalMode
      ? canSubmitGoals
      : question?.isRequired === false
        ? true
        : question?.answerType === "text"
          ? true
          : canSubmitQuestion;

  const showPrimaryAction =
    !showInfoPageMode &&
    (showGoalMode || Boolean(question && isManualSubmitQuestion(question)));

  const usesSolidInfoBackground =
    showInfoPageMode && !hasInfoPageBackgroundImage(displayInfoPage);

  const activeBackgroundUrl = showInfoPageMode
    ? getInfoPageBackgroundUrl(displayInfoPage)
    : questionBackgrounds.desktop;

  const usesResponsiveQuestionBackground =
    !showInfoPageMode &&
    questionBackgrounds.desktop !== questionBackgrounds.mobile;

  const infoPageLayout = showInfoPageMode && displayInfoPage;

  const navButtonClassName = (enabled: boolean) =>
    `flex size-12 shrink-0 items-center justify-center rounded-full border border-slate-border-color bg-white text-black-color shadow-sm transition-opacity ${
      enabled
        ? "cursor-pointer opacity-100 hover:bg-white/90"
        : "cursor-not-allowed opacity-30"
    }`;

  const showBottomNavigation =
    Boolean(errorMessage) ||
    (showInfoPageMode
      ? isInfoPageReviewMode && (canGoBack || canNavigateForwardInHistory)
      : showPrimaryAction || canGoBack || canGoForward);

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {showInfoPageMode && displayInfoPage ? (
        usesSolidInfoBackground ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={getInfoPageFallbackBackgroundStyle()}
          />
        ) : infoPageBackgrounds?.desktop && infoPageBackgrounds.mobile ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
              style={{
                backgroundImage: `url(${infoPageBackgrounds.desktop})`,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
              style={{
                backgroundImage: `url(${infoPageBackgrounds.mobile})`,
              }}
            />
          </>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${
                infoPageBackgrounds?.desktop ||
                infoPageBackgrounds?.mobile ||
                activeBackgroundUrl
              })`,
            }}
          />
        )
      ) : usesResponsiveQuestionBackground ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden bg-cover bg-center bg-no-repeat bg-quiz-start-page md:block"
            style={{
              backgroundImage: `url(${questionBackgrounds.desktop})`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat bg-quiz-start-page md:hidden"
            style={{
              backgroundImage: `url(${questionBackgrounds.mobile})`,
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat bg-quiz-start-page"
          style={{ backgroundImage: `url(${questionBackgrounds.desktop})` }}
        />
      )}
      {!showInfoPageMode ? (
        <div className="pointer-events-none absolute inset-0 bg-white/35" />
      ) : null}

      <div className="relative z-10 flex h-full flex-col">
        <QuizHeader progress={progress} onLogoClick={handleLogoClick} />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <div
              className={
                infoPageLayout
                  ? "absolute inset-0 overflow-y-auto lg:overflow-hidden"
                  : "absolute inset-0 overflow-y-auto"
              }
            >
              <div
                className={
                  infoPageLayout
                    ? "flex h-full w-full flex-col"
                    : "flex min-h-full items-center justify-center px-4 py-6 sm:px-16 md:px-20 lg:px-24"
                }
              >
                <div
                  className={
                    infoPageLayout
                      ? "mx-auto flex h-full w-full max-w-4xl flex-col"
                      : "mx-auto flex w-full max-w-5xl flex-col items-center"
                  }
                >
                {showGoalMode ? (
                  <>
                    <QuizGoalSelectionHeading maxSelection={MAX_GOAL_SELECTION} />
                    <QuizGoalSelection
                      goals={goals}
                      selectedGoalIds={selectedGoalIds}
                      maxSelection={MAX_GOAL_SELECTION}
                      disabled={isSubmitting}
                      onToggleGoal={handleToggleGoal}
                    />
                  </>
                ) : showInfoPageMode && displayInfoPage ? (
                  <QuizInfoPageView infoPage={displayInfoPage} />
                ) : (
                  question && (
                    <>
                      <QuizQuestionHeading question={question} />
                      <QuizQuestionView
                        question={question}
                        selectedValues={selectedValues}
                        selectionOrder={selectionOrder}
                        textValue={textValue}
                        onSelectValue={handleSelectValue}
                        onTextChange={handleTextChange}
                        textError={textAnswerError}
                        dateError={dateAnswerError}
                        disabled={isSubmitting}
                        prefilled={isGeneralFieldLocked}
                        onTextSubmit={
                          question.answerType === "text" && !isSubmitting
                            ? () => {
                                void handleNext();
                              }
                            : undefined
                        }
                      />
                    </>
                  )
                )}
                </div>
              </div>
            </div>
          </div>

          {showBottomNavigation && (
          <div className="shrink-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-6 md:px-10">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-3">
              {isInfoPageReviewMode && canGoBack ? (
              <button
                type="button"
                aria-label={tCommon("previous")}
                disabled={!canGoBack || isSubmitting}
                onClick={handleBack}
                className={`sm:hidden ${navButtonClassName(canGoBack && !isSubmitting)}`}
              >
                <ArrowLeft className="size-6" strokeWidth={2.25} />
              </button>
              ) : !showInfoPageMode ? (
              <button
                type="button"
                aria-label={tCommon("previous")}
                disabled={!canGoBack || isSubmitting}
                onClick={handleBack}
                className={`sm:hidden ${navButtonClassName(canGoBack && !isSubmitting)}`}
              >
                <ArrowLeft className="size-6" strokeWidth={2.25} />
              </button>
              ) : null}

              {showPrimaryAction ? (
                <Button
                  type="button"
                  variant="elevate"
                  size="elevate"
                  className="min-w-0 flex-1 sm:min-w-[180px] sm:flex-none"
                  onClick={handleNext}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <BouncingDotsLoader className="text-white" dotClassName="bg-white" />
                      <span className="sr-only">
                        {isLastQuestion && !showInfoPageMode
                          ? tCommon("submitting")
                          : tQuiz("nextLoading")}
                      </span>
                    </>
                  ) : showInfoPageMode ? (
                    tCommon("next")
                  ) : isSkippingCurrentQuestion ? (
                    tQuiz("skip")
                  ) : isLastQuestion ? (
                    tCommon("submit")
                  ) : (
                    tCommon("next")
                  )}
                </Button>
              ) : null}

              {!showInfoPageMode || isInfoPageReviewMode ? (
              <button
                type="button"
                aria-label={tCommon("next")}
                disabled={!canGoForward || isSubmitting}
                onClick={handleForward}
                className={`sm:hidden ${navButtonClassName(canGoForward && !isSubmitting)}`}
              >
                <ArrowRight className="size-6" strokeWidth={2.25} />
              </button>
              ) : null}
            </div>

            {errorMessage &&
            question?.answerType !== "text" &&
            question?.answerType !== "date_picker" ? (
              <p className="mt-3 text-center font-saans text-sm text-red-600">
                {errorMessage}
              </p>
            ) : null}
          </div>
          )}
        </div>
      </div>

      {(!showInfoPageMode || isInfoPageReviewMode) && canGoBack ? (
        <button
          type="button"
          aria-label={tCommon("previous")}
          disabled={!canGoBack || isSubmitting}
          onClick={handleBack}
          className={`absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 sm:flex md:left-6 lg:left-10 ${navButtonClassName(canGoBack && !isSubmitting)}`}
        >
          <ArrowLeft className="size-6" strokeWidth={2.25} />
        </button>
      ) : null}

      {!showInfoPageMode || isInfoPageReviewMode ? (
        <button
          type="button"
          aria-label={tCommon("next")}
          disabled={!canGoForward || isSubmitting}
          onClick={handleForward}
          className={`absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 sm:flex md:right-6 lg:right-10 ${navButtonClassName(canGoForward && !isSubmitting)}`}
        >
          <ArrowRight className="size-6" strokeWidth={2.25} />
        </button>
      ) : null}

      <SavePlanModal
        isOpen={isLeaveModalOpen}
        sessionId={getSessionId(sessionData)}
        isSaving={isSavingProgress}
        isDiscarding={isDiscardingProgress}
        apiError={leaveActionError}
        onClose={handleCloseLeaveModal}
        onContinueWithoutSaving={handleDiscardProgress}
        onSave={handleSaveProgress}
      />
    </div>
  );
}
