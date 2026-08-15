import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import type {
  QuizStoredAnswer,
  QuizStoredGoalAnswer,
  QuizStoredOptionAnswer,
  QuizStoredTextAnswer,
} from "./quizNavigationStorage";

export interface QuizAnswerFormState {
  selectedValues: string[];
  selectionOrder: string[];
  selectedGoalIds: string[];
  textValue: string;
}

export function buildStoredAnswerFromQuestion(
  question: QuizQuestion,
  selectionOrder: string[],
  textValue: string
): QuizStoredAnswer {
  if (question.answerType === "answer") {
    return {
      type: "answer",
      values: [...selectionOrder],
      selectionOrder: [...selectionOrder],
    } satisfies QuizStoredOptionAnswer;
  }

  if (question.answerType === "text") {
    return {
      type: "text",
      value: textValue.trim(),
    } satisfies QuizStoredTextAnswer;
  }

  return {
    type: "date",
    value: textValue.trim(),
  } satisfies QuizStoredTextAnswer;
}

export function buildStoredGoalAnswer(goalIds: string[]): QuizStoredGoalAnswer {
  return {
    type: "goals",
    goalIds: [...goalIds],
  };
}

function readAnswerTextValue(answer: Record<string, unknown>): string {
  if (typeof answer.value === "string") {
    return answer.value;
  }

  if (Array.isArray(answer.values) && answer.values.length > 0) {
    return String(answer.values[0]);
  }

  if (Array.isArray(answer.selectionOrder) && answer.selectionOrder.length > 0) {
    return String(answer.selectionOrder[0]);
  }

  return "";
}

export function normalizeSelectedGoalIdsFromApi(
  selectedGoals?: Array<string | { goalId: string; priorityOrder?: number }>
): string[] {
  if (!selectedGoals?.length) return [];

  return selectedGoals
    .map((goal) => (typeof goal === "string" ? goal : goal.goalId))
    .filter((goalId): goalId is string => Boolean(goalId));
}

export function normalizeStoredAnswerFromApi(
  raw: unknown,
  question?: QuizQuestion | null
): QuizStoredAnswer | null {
  if (!raw || typeof raw !== "object") return null;

  const answer = raw as Record<string, unknown>;
  const type = typeof answer.type === "string" ? answer.type : "";

  if (type === "goals" && Array.isArray(answer.goalIds)) {
    return {
      type: "goals",
      goalIds: answer.goalIds.map(String),
    };
  }

  if (type === "answer") {
    const values = Array.isArray(answer.values)
      ? answer.values.map(String)
      : [];
    const selectionOrder = Array.isArray(answer.selectionOrder)
      ? answer.selectionOrder.map(String)
      : values;

    return {
      type: "answer",
      values: [...values],
      selectionOrder: [...selectionOrder],
    };
  }

  if (type === "text" || type === "date" || type === "date_picker") {
    const textValue = readAnswerTextValue(answer);
    const isTextQuestion =
      type === "text" || question?.answerType === "text";

    return isTextQuestion
      ? { type: "text", value: textValue }
      : { type: "date", value: textValue };
  }

  return null;
}

export function normalizeNavigationAnswers(
  answers: Record<string, QuizStoredAnswer | unknown>,
  questionSnapshots: Record<string, QuizQuestion>
): Record<string, QuizStoredAnswer> {
  const normalized: Record<string, QuizStoredAnswer> = {};

  for (const [questionId, rawAnswer] of Object.entries(answers)) {
    const stored = normalizeStoredAnswerFromApi(
      rawAnswer,
      questionSnapshots[questionId]
    );
    if (stored) {
      normalized[questionId] = stored;
    }
  }

  return normalized;
}

export function getAnswerFormStateFromStored(
  answer: QuizStoredAnswer | undefined,
  isGoals: boolean
): QuizAnswerFormState {
  if (isGoals) {
    return {
      selectedValues: [],
      selectionOrder: [],
      selectedGoalIds:
        answer?.type === "goals" ? [...answer.goalIds] : [],
      textValue: "",
    };
  }

  if (!answer) {
    return {
      selectedValues: [],
      selectionOrder: [],
      selectedGoalIds: [],
      textValue: "",
    };
  }

  if (answer.type === "answer") {
    return {
      selectedValues: [...answer.values],
      selectionOrder: [...answer.selectionOrder],
      selectedGoalIds: [],
      textValue: "",
    };
  }

  if (answer.type === "text" || answer.type === "date") {
    return {
      selectedValues: [],
      selectionOrder: [],
      selectedGoalIds: [],
      textValue: answer.value,
    };
  }

  const fallback = normalizeStoredAnswerFromApi(answer);
  if (fallback?.type === "answer") {
    return {
      selectedValues: [...fallback.values],
      selectionOrder: [...fallback.selectionOrder],
      selectedGoalIds: [],
      textValue: "",
    };
  }

  if (fallback && (fallback.type === "text" || fallback.type === "date")) {
    return {
      selectedValues: [],
      selectionOrder: [],
      selectedGoalIds: [],
      textValue: fallback.value,
    };
  }

  return {
    selectedValues: [],
    selectionOrder: [],
    selectedGoalIds: [],
    textValue: "",
  };
}
