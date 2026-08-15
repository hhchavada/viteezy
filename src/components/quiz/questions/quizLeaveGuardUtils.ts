import type { QuizQuestion, QuizSessionData } from "@/store/api/types/healthQuiz.types";
import {
  GOALS_STEP_ID,
  isInfoPageStep,
  type QuizNavigationState,
} from "./quizNavigationStorage";

const GENERAL_QUIZ_CATEGORY = "general";

function normalizeCategoryCode(
  category?: string | null
): string | undefined {
  return category?.trim().toLowerCase() || undefined;
}

function getQuestionCategoryCode(
  question?: QuizQuestion | null
): string | undefined {
  return normalizeCategoryCode(question?.categoryId?.code);
}

function countAnsweredQuestions(
  session: QuizSessionData | null,
  navAnsweredCount = 0
): number {
  const fromProgress = session?.progress?.answered;
  if (typeof fromProgress === "number" && fromProgress > 0) {
    return fromProgress;
  }

  return navAnsweredCount;
}

export function countNavQuestionAnswers(
  answers?: Record<string, unknown> | null
): number {
  if (!answers) return 0;

  return Object.keys(answers).filter(
    (stepId) => stepId !== GOALS_STEP_ID && !isInfoPageStep(stepId)
  ).length;
}

function hasGoalsAnswered(
  answers?: QuizNavigationState["answers"] | null
): boolean {
  const goalAnswer = answers?.[GOALS_STEP_ID];
  if (!goalAnswer || goalAnswer.type !== "goals") return false;
  return goalAnswer.goalIds.length > 0;
}

function hasVisitedGoalsStep(navState?: Pick<
  QuizNavigationState,
  "currentQuestionId" | "visitedQuestionIds"
> | null): boolean {
  if (!navState) return false;

  if (navState.currentQuestionId === GOALS_STEP_ID) return true;
  return navState.visitedQuestionIds.includes(GOALS_STEP_ID);
}

function hasAnsweredNonGeneralQuestion(
  answers?: QuizNavigationState["answers"] | null,
  questionSnapshots?: QuizNavigationState["questionSnapshots"]
): boolean {
  if (!answers || !questionSnapshots) return false;

  for (const stepId of Object.keys(answers)) {
    if (stepId === GOALS_STEP_ID || isInfoPageStep(stepId)) continue;

    const category = getQuestionCategoryCode(questionSnapshots[stepId]);
    if (category && category !== GENERAL_QUIZ_CATEGORY) {
      return true;
    }
  }

  return false;
}

function hasSessionProgressedPastGeneral(
  session: QuizSessionData | null
): boolean {
  const nextCategory = normalizeCategoryCode(session?.nextCategory);
  const currentCategory = normalizeCategoryCode(session?.currentCategory);

  if (nextCategory && nextCategory !== GENERAL_QUIZ_CATEGORY) return true;
  if (currentCategory && currentCategory !== GENERAL_QUIZ_CATEGORY) return true;

  return false;
}

/**
 * True when the user has moved beyond general-only quiz progress
 * (non-general answers, goals, or session category past general).
 */
export function hasAnsweredOutsideGeneralCategory(options: {
  session?: QuizSessionData | null;
  answers?: QuizNavigationState["answers"] | null;
  questionSnapshots?: QuizNavigationState["questionSnapshots"];
  navState?: Pick<
    QuizNavigationState,
    "currentQuestionId" | "visitedQuestionIds"
  > | null;
}): boolean {
  if (hasGoalsAnswered(options.answers)) return true;
  if (hasVisitedGoalsStep(options.navState)) return true;
  if (
    hasAnsweredNonGeneralQuestion(
      options.answers,
      options.questionSnapshots
    )
  ) {
    return true;
  }

  return hasSessionProgressedPastGeneral(options.session ?? null);
}

/**
 * Show leave popup when at least one question is answered and the user has
 * progressed beyond general-only quiz content — including when reviewing
 * general questions via the back button.
 */
export function shouldShowQuizLeaveGuard(
  session: QuizSessionData | null,
  options?: {
    navAnsweredCount?: number;
    answers?: QuizNavigationState["answers"] | null;
    questionSnapshots?: QuizNavigationState["questionSnapshots"];
    navState?: Pick<
      QuizNavigationState,
      "currentQuestionId" | "visitedQuestionIds"
    > | null;
  }
): boolean {
  const answeredCount = countAnsweredQuestions(
    session,
    options?.navAnsweredCount ?? 0
  );
  if (answeredCount < 1) return false;

  return hasAnsweredOutsideGeneralCategory({
    session,
    answers: options?.answers,
    questionSnapshots: options?.questionSnapshots,
    navState: options?.navState,
  });
}
