import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import type { QuizMessageTranslator } from "./quizI18n";

export interface GeneralTextValidationResult {
  valid: boolean;
  error: string | null;
  normalized: string | null;
}

const NAME_PATTERN = /^[a-zA-ZÀ-ÿ' -]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isGeneralNameQuestion(question: QuizQuestion): boolean {
  return question.questionCode === "general_name";
}

export function isGeneralEmailQuestion(question: QuizQuestion): boolean {
  return question.questionCode === "general_email";
}

export function validateGeneralNameAnswer(
  value: string,
  isRequired = true,
  t?: QuizMessageTranslator
): GeneralTextValidationResult {
  const trimmed = value.trim();
  const msg = (key: string) => t?.(key) ?? key;

  if (!trimmed) {
    return isRequired
      ? {
          valid: false,
          error: msg("validationNameRequired"),
          normalized: null,
        }
      : { valid: true, error: null, normalized: null };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: msg("validationNameMinLength"),
      normalized: null,
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      error: msg("validationNameMaxLength"),
      normalized: null,
    };
  }

  if (!NAME_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: msg("validationNameInvalid"),
      normalized: null,
    };
  }

  return { valid: true, error: null, normalized: trimmed };
}

export function validateGeneralEmailAnswer(
  value: string,
  isRequired = true,
  t?: QuizMessageTranslator
): GeneralTextValidationResult {
  const trimmed = value.trim();
  const msg = (key: string) => t?.(key) ?? key;

  if (!trimmed) {
    return isRequired
      ? {
          valid: false,
          error: msg("validationEmailRequired"),
          normalized: null,
        }
      : { valid: true, error: null, normalized: null };
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: msg("validationEmailInvalid"),
      normalized: null,
    };
  }

  return { valid: true, error: null, normalized: trimmed };
}

export function validateGeneralTextAnswer(
  question: QuizQuestion,
  value: string,
  t?: QuizMessageTranslator
): GeneralTextValidationResult {
  if (isGeneralNameQuestion(question)) {
    return validateGeneralNameAnswer(value, question.isRequired !== false, t);
  }

  if (isGeneralEmailQuestion(question)) {
    return validateGeneralEmailAnswer(value, question.isRequired !== false, t);
  }

  const trimmed = value.trim();

  if (question.isRequired === false) {
    return { valid: true, error: null, normalized: trimmed || null };
  }

  if (!trimmed) {
    return { valid: false, error: null, normalized: null };
  }

  return { valid: true, error: null, normalized: trimmed };
}

export function isGeneralTextInputQuestion(question: QuizQuestion): boolean {
  return isGeneralNameQuestion(question) || isGeneralEmailQuestion(question);
}
