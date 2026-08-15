"use client";

import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import QuizAnswerPills, { QuizAnswerCards } from "./QuizAnswerPills";
import QuizTextAnswer from "./QuizTextAnswer";
import QuizDateAnswer from "./QuizDateAnswer";
import {
  getLocalizedText,
  shouldUseCardLayout,
  sortOptions,
} from "./utils";

interface QuizQuestionViewProps {
  question: QuizQuestion;
  selectedValues: string[];
  selectionOrder: string[];
  textValue: string;
  onSelectValue: (value: string) => void;
  onTextChange: (value: string) => void;
  textError?: string | null;
  dateError?: string | null;
  disabled?: boolean;
  prefilled?: boolean;
  onTextSubmit?: () => void;
}

export default function QuizQuestionView({
  question,
  selectedValues,
  selectionOrder,
  textValue,
  onSelectValue,
  onTextChange,
  textError = null,
  dateError = null,
  disabled = false,
  prefilled = false,
  onTextSubmit,
}: QuizQuestionViewProps) {
  const sortedOptions = sortOptions(question.options);

  if (question.answerType === "text") {
    return (
      <QuizTextAnswer
        question={question}
        value={textValue}
        onChange={onTextChange}
        disabled={disabled}
        prefilled={prefilled}
        error={textError}
        onEnterPress={onTextSubmit}
      />
    );
  }

  if (question.answerType === "date_picker") {
    return (
      <QuizDateAnswer
        question={question}
        value={textValue}
        onChange={onTextChange}
        disabled={disabled}
        error={dateError}
      />
    );
  }

  if (shouldUseCardLayout(question)) {
    return (
      <QuizAnswerCards
        options={sortedOptions}
        selectedValues={selectedValues}
        selectionOrder={selectionOrder}
        onSelect={onSelectValue}
        multiple={question.answerSelection === "multiple"}
        maxSelection={question.maxSelection}
        disabled={disabled}
      />
    );
  }

  return (
    <QuizAnswerPills
      options={sortedOptions}
      selectedValues={selectedValues}
      onSelect={onSelectValue}
      disabled={disabled}
    />
  );
}

export function QuizQuestionHeading({ question }: { question: QuizQuestion }) {
  const subtitle = getLocalizedText(question.subtitle);

  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 md:mb-12">
      <h1 className="font-saans text-2xl font-medium leading-tight text-black-color sm:text-3xl md:text-4xl">
        {getLocalizedText(question.title)}
      </h1>
      {subtitle && (
        <p className="mt-3 font-saans text-sm text-light-gray-color sm:text-base md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
