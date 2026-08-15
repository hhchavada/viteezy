import type {
  QuizInfoPage,
  QuizQuestion,
  QuizSessionAnswersData,
  QuizSessionData,
} from "@/store/api/types/healthQuiz.types";
import { QUIZ_RESUME_FROM_API_KEY, QUIZ_SESSION_STORAGE_KEY } from "./constants";
import {
  normalizeNavigationAnswers,
  normalizeSelectedGoalIdsFromApi,
} from "./quizNavigationHelpers";

export const GOALS_STEP_ID = "__goals__";
export const INFO_PAGE_STEP_PREFIX = "__info__";

export function getInfoPageStepId(infoPageId: string): string {
  return `${INFO_PAGE_STEP_PREFIX}${infoPageId}`;
}

export function isInfoPageStep(stepId: string | null | undefined): boolean {
  return Boolean(stepId?.startsWith(INFO_PAGE_STEP_PREFIX));
}

function appendUniqueInfoPages(
  target: QuizInfoPage[],
  seen: Set<string>,
  pages: Array<QuizInfoPage | null | undefined>
): void {
  for (const page of pages) {
    if (!page?._id || seen.has(page._id)) continue;
    seen.add(page._id);
    target.push(page);
  }
}

export function resolveInfoPagesFromSession(
  session: QuizSessionData
): QuizInfoPage[] {
  const ordered: QuizInfoPage[] = [];
  const seen = new Set<string>();

  // `infoPage` is the first page to show; `infoPages` keeps backend order after it.
  appendUniqueInfoPages(ordered, seen, [session.infoPage]);

  if (session.infoPages?.length) {
    appendUniqueInfoPages(ordered, seen, session.infoPages);
    return ordered;
  }

  return ordered;
}

/** Last info page's `questionRef` — the question to show after all info pages. */
export function resolvePendingQuestionRefAfterInfoPages(
  session: QuizSessionData
): string | null {
  const pages = resolveInfoPagesFromSession(session);
  for (let i = pages.length - 1; i >= 0; i--) {
    const ref = pages[i]?.questionRef?.trim();
    if (ref) return ref;
  }
  return null;
}

export function resolveQuestionAfterInfoPages(
  session: QuizSessionData,
  pendingQuestionRef?: string | null
): QuizQuestion | undefined {
  if (session.isLastQuestion && session.lastQuestion) {
    return session.lastQuestion;
  }

  const ref = pendingQuestionRef?.trim();

  const candidates: QuizQuestion[] = [];
  for (const question of [
    session.nextQuestion,
    session.currentQuestion,
    session.firstQuestion,
    ...(session.questions ?? []),
  ]) {
    if (question) candidates.push(question);
  }

  if (ref) {
    const matched = candidates.find((question) => question._id === ref);
    if (matched) return matched;
  }

  return (
    session.nextQuestion ??
    session.currentQuestion ??
    session.firstQuestion ??
    undefined
  );
}

export function hasUnvisitedInfoPages(
  navState: QuizNavigationState,
  session: QuizSessionData
): boolean {
  return resolveInfoPagesFromSession(session).some((page) => {
    if (!page._id) return false;
    return !navState.visitedQuestionIds.includes(getInfoPageStepId(page._id));
  });
}

export interface QuizStoredOptionAnswer {
  type: "answer";
  values: string[];
  selectionOrder: string[];
}

export interface QuizStoredTextAnswer {
  type: "text" | "date";
  value: string;
}

export interface QuizStoredGoalAnswer {
  type: "goals";
  goalIds: string[];
}

export type QuizStoredAnswer =
  | QuizStoredOptionAnswer
  | QuizStoredTextAnswer
  | QuizStoredGoalAnswer;

export interface QuizNavigationState {
  answers: Record<string, QuizStoredAnswer>;
  currentQuestionId: string | null;
  visitedQuestionIds: string[];
  questionSnapshots: Record<string, QuizQuestion>;
  infoPageSnapshots?: Record<string, QuizInfoPage>;
  /** Question to show after all info pages from the submit response. */
  pendingQuestionRef?: string;
  /** Full submit-answer payload kept while info pages are shown. */
  postInfoResumeSession?: QuizSessionData;
}

function getNavigationKey(sessionId: string): string {
  return `${QUIZ_SESSION_STORAGE_KEY}_nav_${sessionId}`;
}

export function loadQuizNavigationState(
  sessionId: string
): QuizNavigationState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getNavigationKey(sessionId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as QuizNavigationState;
    return {
      ...parsed,
      answers: normalizeNavigationAnswers(
        parsed.answers ?? {},
        parsed.questionSnapshots ?? {}
      ),
    };
  } catch {
    return null;
  }
}

export function saveQuizNavigationState(
  sessionId: string,
  state: QuizNavigationState
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getNavigationKey(sessionId), JSON.stringify(state));
}

export function clearQuizNavigationState(sessionId?: string | null): void {
  if (typeof window === "undefined" || !sessionId) return;
  localStorage.removeItem(getNavigationKey(sessionId));
}

export function createInitialNavigationState(
  question: QuizQuestion
): QuizNavigationState {
  return {
    answers: {},
    currentQuestionId: question._id,
    visitedQuestionIds: [question._id],
    questionSnapshots: {
      [question._id]: question,
    },
  };
}

export function truncateNavigationAtStep(
  state: QuizNavigationState,
  stepId: string,
  storedAnswer: QuizStoredAnswer,
  questionSnapshot?: QuizQuestion,
  answeredStepIndex?: number
): QuizNavigationState {
  let stepIndex = state.visitedQuestionIds.indexOf(stepId);

  if (
    stepIndex < 0 &&
    answeredStepIndex !== undefined &&
    state.visitedQuestionIds[answeredStepIndex] === stepId
  ) {
    stepIndex = answeredStepIndex;
  }

  const visitedQuestionIds =
    stepIndex >= 0
      ? state.visitedQuestionIds.slice(0, stepIndex + 1)
      : [...state.visitedQuestionIds, stepId];

  const visitedSet = new Set(visitedQuestionIds);
  const answers: Record<string, QuizStoredAnswer> = {};
  const questionSnapshots: Record<string, QuizQuestion> = {};
  const infoPageSnapshots = state.infoPageSnapshots
    ? Object.fromEntries(
        Object.entries(state.infoPageSnapshots).filter(([infoStepId]) =>
          visitedSet.has(infoStepId)
        )
      )
    : undefined;

  for (const id of visitedQuestionIds) {
    if (id === stepId) {
      answers[id] = storedAnswer;
      if (questionSnapshot) {
        questionSnapshots[id] = questionSnapshot;
      } else if (state.questionSnapshots[id]) {
        questionSnapshots[id] = state.questionSnapshots[id];
      }
      continue;
    }

    if (state.answers[id]) {
      answers[id] = state.answers[id];
    }

    if (state.questionSnapshots[id]) {
      questionSnapshots[id] = state.questionSnapshots[id];
    }
  }

  return {
    answers,
    currentQuestionId: stepId,
    visitedQuestionIds,
    questionSnapshots,
    infoPageSnapshots,
    pendingQuestionRef: undefined,
    postInfoResumeSession: undefined,
  };
}

export function isGoalSelectionStep(session: QuizSessionData): boolean {
  return Boolean(
    session.isGoalSelectionRequired && session.nextCategory === "goal"
  );
}

export function resolveQuestionFromApiSession(
  session: QuizSessionData
): QuizQuestion | undefined {
  return (
    session.currentQuestion ??
    session.nextQuestion ??
    (session.isLastQuestion ? session.lastQuestion ?? undefined : undefined) ??
    session.questions?.[0] ??
    session.firstQuestion ??
    undefined
  );
}

/** After PATCH /answers — the upcoming step is always `nextQuestion`. */
export function resolveNextQuestionFromSubmitResponse(
  session: QuizSessionData
): QuizQuestion | undefined {
  return (
    session.nextQuestion ??
    (session.isLastQuestion ? session.lastQuestion ?? undefined : undefined) ??
    undefined
  );
}

function resolveHistoryIndexForQuestion(
  visitedQuestionIds: string[],
  questionId: string
): number {
  const index = visitedQuestionIds.indexOf(questionId);
  if (index >= 0) return index;
  return Math.max(visitedQuestionIds.length - 1, 0);
}

export function advanceNavigationFromApi(
  truncated: QuizNavigationState,
  apiSession: QuizSessionData
): { state: QuizNavigationState; historyIndex: number } {
  const allInfoPages = resolveInfoPagesFromSession(apiSession);
  const unvisitedInfoPages = allInfoPages.filter((page) => {
    if (!page._id) return false;
    return !truncated.visitedQuestionIds.includes(getInfoPageStepId(page._id));
  });

  if (unvisitedInfoPages.length > 0) {
    let visitedQuestionIds = [...truncated.visitedQuestionIds];
    const infoPageSnapshots = { ...truncated.infoPageSnapshots };
    const questionSnapshots = { ...truncated.questionSnapshots };
    const pendingQuestionRef =
      resolvePendingQuestionRefAfterInfoPages(apiSession) ??
      truncated.pendingQuestionRef;
    const pendingQuestion = resolveQuestionAfterInfoPages(
      apiSession,
      pendingQuestionRef
    );

    if (pendingQuestion) {
      questionSnapshots[pendingQuestion._id] = pendingQuestion;
    }

    for (const page of allInfoPages) {
      if (!page._id) continue;

      const infoStepId = getInfoPageStepId(page._id);
      if (!visitedQuestionIds.includes(infoStepId)) {
        visitedQuestionIds = [...visitedQuestionIds, infoStepId];
      }
      infoPageSnapshots[infoStepId] = page;
    }

    const firstInfoStepId = getInfoPageStepId(unvisitedInfoPages[0]._id);

    return {
      state: {
        ...truncated,
        visitedQuestionIds,
        currentQuestionId: firstInfoStepId,
        infoPageSnapshots,
        questionSnapshots,
        pendingQuestionRef,
        postInfoResumeSession: apiSession,
      },
      historyIndex: visitedQuestionIds.indexOf(firstInfoStepId),
    };
  }

  if (isGoalSelectionStep(apiSession)) {
    const visitedQuestionIds = truncated.visitedQuestionIds.includes(
      GOALS_STEP_ID
    )
      ? truncated.visitedQuestionIds
      : [...truncated.visitedQuestionIds, GOALS_STEP_ID];

    return {
      state: {
        ...truncated,
        visitedQuestionIds,
        currentQuestionId: GOALS_STEP_ID,
      },
      historyIndex: visitedQuestionIds.length - 1,
    };
  }

  const pendingRef =
    truncated.pendingQuestionRef ??
    resolvePendingQuestionRefAfterInfoPages(apiSession);

  const nextQuestion = resolveNextQuestionFromSubmitResponse(apiSession);

  if (!nextQuestion) {
    return {
      state: {
        ...truncated,
        pendingQuestionRef: pendingRef ?? truncated.pendingQuestionRef,
      },
      historyIndex: resolveHistoryIndexForQuestion(
        truncated.visitedQuestionIds,
        truncated.currentQuestionId ?? truncated.visitedQuestionIds.at(-1) ?? ""
      ),
    };
  }

  const visitedQuestionIds = truncated.visitedQuestionIds.includes(
    nextQuestion._id
  )
    ? truncated.visitedQuestionIds
    : [...truncated.visitedQuestionIds, nextQuestion._id];

  return {
    state: {
      ...truncated,
      visitedQuestionIds,
      currentQuestionId: nextQuestion._id,
      questionSnapshots: {
        ...truncated.questionSnapshots,
        [nextQuestion._id]: nextQuestion,
      },
      pendingQuestionRef: undefined,
      postInfoResumeSession: undefined,
    },
    historyIndex: resolveHistoryIndexForQuestion(
      visitedQuestionIds,
      nextQuestion._id
    ),
  };
}

export function mergeNavigationAfterSubmit(
  state: QuizNavigationState,
  answeredStepId: string,
  storedAnswer: QuizStoredAnswer,
  questionSnapshot: QuizQuestion | undefined,
  apiSession: QuizSessionData,
  isReAnswer: boolean,
  answeredStepIndex?: number
): { state: QuizNavigationState; historyIndex: number } {
  const base = isReAnswer
    ? truncateNavigationAtStep(
        state,
        answeredStepId,
        storedAnswer,
        questionSnapshot,
        answeredStepIndex
      )
    : {
        ...state,
        answers: {
          ...state.answers,
          [answeredStepId]: storedAnswer,
        },
        questionSnapshots: questionSnapshot
          ? {
              ...state.questionSnapshots,
              [answeredStepId]: questionSnapshot,
            }
          : state.questionSnapshots,
      };

  return advanceNavigationFromApi(base, apiSession);
}

export function advanceFromInfoPage(
  state: QuizNavigationState,
  nextQuestion: QuizQuestion
): { state: QuizNavigationState; historyIndex: number } {
  const visitedQuestionIds = state.visitedQuestionIds.includes(nextQuestion._id)
    ? state.visitedQuestionIds
    : [...state.visitedQuestionIds, nextQuestion._id];

  return {
    state: {
      ...state,
      visitedQuestionIds,
      currentQuestionId: nextQuestion._id,
      questionSnapshots: {
        ...state.questionSnapshots,
        [nextQuestion._id]: nextQuestion,
      },
      pendingQuestionRef: undefined,
      postInfoResumeSession: undefined,
    },
    historyIndex: visitedQuestionIds.length - 1,
  };
}

export function initNavigationFromSession(session: QuizSessionData): {
  state: QuizNavigationState;
  index: number;
} {
  const sessionId = session.sessionId;
  const empty: QuizNavigationState = {
    answers: {},
    currentQuestionId: null,
    visitedQuestionIds: [],
    questionSnapshots: {},
  };

  if (!sessionId) {
    return { state: empty, index: 0 };
  }

  const existing = loadQuizNavigationState(sessionId);

  if (isGoalSelectionStep(session)) {
    if (existing) {
      const visitedQuestionIds = existing.visitedQuestionIds.includes(
        GOALS_STEP_ID
      )
        ? existing.visitedQuestionIds
        : [...existing.visitedQuestionIds, GOALS_STEP_ID];

      const state: QuizNavigationState = {
        ...existing,
        visitedQuestionIds,
        currentQuestionId: GOALS_STEP_ID,
      };

      saveQuizNavigationState(sessionId, state);
      const index = visitedQuestionIds.indexOf(GOALS_STEP_ID);

      return {
        state,
        index: index >= 0 ? index : visitedQuestionIds.length - 1,
      };
    }

    const currentQuestion = session.currentQuestion;
    const state: QuizNavigationState = currentQuestion
      ? {
          answers: {},
          currentQuestionId: GOALS_STEP_ID,
          visitedQuestionIds: [currentQuestion._id, GOALS_STEP_ID],
          questionSnapshots: { [currentQuestion._id]: currentQuestion },
        }
      : {
          answers: {},
          currentQuestionId: GOALS_STEP_ID,
          visitedQuestionIds: [GOALS_STEP_ID],
          questionSnapshots: {},
        };

    saveQuizNavigationState(sessionId, state);
    return { state, index: state.visitedQuestionIds.length - 1 };
  }

  const currentQuestion = session.currentQuestion;
  if (!currentQuestion) {
    return { state: existing ?? empty, index: 0 };
  }

  if (!existing) {
    const state = createInitialNavigationState(currentQuestion);
    saveQuizNavigationState(sessionId, state);
    return { state, index: 0 };
  }

  const questionSnapshots = {
    ...existing.questionSnapshots,
    [currentQuestion._id]: currentQuestion,
  };

  const visitedQuestionIds = existing.visitedQuestionIds.includes(
    currentQuestion._id
  )
    ? existing.visitedQuestionIds
    : [...existing.visitedQuestionIds, currentQuestion._id];

  const state: QuizNavigationState = {
    ...existing,
    questionSnapshots,
    visitedQuestionIds,
    currentQuestionId: currentQuestion._id,
  };

  saveQuizNavigationState(sessionId, state);

  const index = visitedQuestionIds.indexOf(currentQuestion._id);

  return {
    state,
    index: index >= 0 ? index : visitedQuestionIds.length - 1,
  };
}

function normalizeQuestionSnapshot(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    options: question.options ?? [],
  };
}

export function buildNavigationFromSessionAnswers(
  data: QuizSessionAnswersData
): { state: QuizNavigationState; historyIndex: number } {
  let visitedQuestionIds = [...data.visitedQuestionIds];
  const questionSnapshots = Object.fromEntries(
    Object.entries(data.questionSnapshots ?? {}).map(([id, snapshot]) => [
      id,
      normalizeQuestionSnapshot(snapshot),
    ])
  );

  const answers = normalizeNavigationAnswers(
    data.answers ?? {},
    questionSnapshots
  );

  const selectedGoalIds = normalizeSelectedGoalIdsFromApi(data.selectedGoals);
  const isGoalStep =
    data.currentQuestionId === GOALS_STEP_ID ||
    (data.isGoalSelectionRequired && data.nextCategory === "goal");

  if (selectedGoalIds.length > 0) {
    answers[GOALS_STEP_ID] = {
      type: "goals",
      goalIds: selectedGoalIds,
    };
  }

  if (isGoalStep) {
    if (!visitedQuestionIds.includes(GOALS_STEP_ID)) {
      visitedQuestionIds = [...visitedQuestionIds, GOALS_STEP_ID];
    }
  }

  const currentQuestionId = isGoalStep
    ? GOALS_STEP_ID
    : data.currentQuestionId;

  const state: QuizNavigationState = {
    answers,
    currentQuestionId,
    visitedQuestionIds,
    questionSnapshots,
  };

  const historyTarget =
    currentQuestionId ?? visitedQuestionIds[visitedQuestionIds.length - 1] ?? null;
  const historyIndex = historyTarget
    ? visitedQuestionIds.indexOf(historyTarget)
    : 0;

  return {
    state,
    historyIndex: historyIndex >= 0 ? historyIndex : visitedQuestionIds.length - 1,
  };
}

export function buildSessionDataFromAnswers(
  data: QuizSessionAnswersData,
  existing?: QuizSessionData | null
): QuizSessionData {
  const isGoalStep =
    data.currentQuestionId === GOALS_STEP_ID ||
    (data.isGoalSelectionRequired && data.nextCategory === "goal");

  const currentQuestion =
    !isGoalStep && data.currentQuestionId
      ? data.questionSnapshots[data.currentQuestionId]
        ? normalizeQuestionSnapshot(data.questionSnapshots[data.currentQuestionId])
        : existing?.currentQuestion
      : undefined;

  return {
    ...existing,
    sessionId: data.sessionId,
    status: data.status ?? existing?.status ?? "IN_PROGRESS",
    progress: data.progress ?? existing?.progress,
    currentQuestion,
    isGoalSelectionRequired:
      data.isGoalSelectionRequired ?? existing?.isGoalSelectionRequired,
    nextCategory: data.nextCategory ?? existing?.nextCategory,
    currentCategory: data.currentCategory ?? existing?.currentCategory,
  };
}

export function consumeResumeFromApiFlag(): boolean {
  if (typeof window === "undefined") return false;

  const shouldRestore = sessionStorage.getItem(QUIZ_RESUME_FROM_API_KEY) === "true";
  sessionStorage.removeItem(QUIZ_RESUME_FROM_API_KEY);
  return shouldRestore;
}
