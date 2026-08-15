"use client";

import { type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import { cn } from "@/lib/utils";
import {
  isGeneralEmailQuestion,
  isGeneralTextInputQuestion,
} from "./generalQuestionValidation";
import { getLocalizedText } from "./utils";

interface QuizTextAnswerProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  prefilled?: boolean;
  error?: string | null;
  onEnterPress?: () => void;
}

const fieldClassName =
  "w-full rounded-2xl border bg-white px-5 py-4 font-saans text-base text-black-color outline-none transition-colors focus:border-teal-green-color";

const disabledFieldClassName =
  "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] opacity-80 hover:outline-none focus:border-[#E5E7EB]";

const prefilledFieldClassName =
  "cursor-not-allowed border-slate-border-color bg-white text-black-color/70 read-only:focus:border-slate-border-color";

export default function QuizTextAnswer({
  question,
  value,
  onChange,
  disabled = false,
  prefilled = false,
  error = null,
  onEnterPress,
}: QuizTextAnswerProps) {
  const tQuiz = useTranslations("Quiz");
  const placeholder =
    getLocalizedText(question.placeholder) || tQuiz("textAnswerPlaceholder");
  const useSingleLineInput = isGeneralTextInputQuestion(question);
  const isEmailField = isGeneralEmailQuestion(question);
  const hasError = Boolean(error);
  const isSubmitDisabled = disabled && !prefilled;

  const handleEnterKey = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    if (!onEnterPress || isSubmitDisabled) return;

    event.preventDefault();
    onEnterPress();
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {useSingleLineInput ? (
        <input
          type={isEmailField ? "email" : "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleEnterKey}
          placeholder={placeholder}
          disabled={isSubmitDisabled}
          readOnly={prefilled}
          autoComplete={isEmailField ? "email" : "name"}
          aria-invalid={hasError}
          aria-readonly={prefilled || undefined}
          aria-describedby={hasError ? "quiz-text-answer-error" : undefined}
          className={cn(
            fieldClassName,
            prefilled
              ? prefilledFieldClassName
              : isSubmitDisabled
                ? disabledFieldClassName
                : hasError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-border-color"
          )}
        />
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              handleEnterKey(event);
            }
          }}
          placeholder={placeholder}
          disabled={isSubmitDisabled}
          readOnly={prefilled}
          rows={4}
          aria-invalid={hasError}
          aria-readonly={prefilled || undefined}
          aria-describedby={hasError ? "quiz-text-answer-error" : undefined}
          className={cn(
            fieldClassName,
            "resize-none",
            prefilled
              ? prefilledFieldClassName
              : isSubmitDisabled
                ? disabledFieldClassName
                : hasError
                  ? "border-red-500 focus:border-red-500"
                  : "border-slate-border-color"
          )}
        />
      )}

      <p
        id="quiz-text-answer-error"
        role={hasError ? "alert" : undefined}
        aria-hidden={!hasError}
        className={cn(
          "mt-3 min-h-5 text-center font-saans text-sm font-medium leading-5 text-red-600",
          !hasError && "invisible"
        )}
      >
        {error ?? "\u00A0"}
      </p>
    </div>
  );
}
