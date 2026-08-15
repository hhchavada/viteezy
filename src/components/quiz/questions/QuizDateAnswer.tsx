"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { QuizQuestion } from "@/store/api/types/healthQuiz.types";
import { cn } from "@/lib/utils";
import {
  buildRawDateValue,
  getDayOptions,
  getDaysInMonth,
  getMonthOptions,
  getYearOptions,
  parseDateValue,
  resolveDatePickerConfig,
  sanitizeDigits,
  validateDateAnswer,
} from "./dateValidation";

interface QuizDateAnswerProps {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string | null;
}

type DatePart = "year" | "month" | "day";

interface DatePickerFieldProps {
  id: string;
  label: string;
  placeholder: string;
  fieldValue: string;
  options: string[];
  maxLength: number;
  isOpen: boolean;
  hasError?: boolean;
  disabled?: boolean;
  widthClass?: string;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  openOptionsAria: (field: string) => string;
  optionsAria: (field: string) => string;
}

function DatePickerField({
  id,
  label,
  placeholder,
  fieldValue,
  options,
  maxLength,
  isOpen,
  hasError,
  disabled,
  widthClass = "w-[84px]",
  onOpen,
  onClose,
  onChange,
  onBlur,
  openOptionsAria,
  optionsAria,
}: DatePickerFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const blockManualInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Tab", "Escape", "Enter", "ArrowUp", "ArrowDown"];
    if (allowedKeys.includes(event.key)) return;
    event.preventDefault();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={containerRef} className={cn("relative", widthClass)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          placeholder={placeholder}
          value={fieldValue}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={onOpen}
          onClick={onOpen}
          onBlur={onBlur}
          onKeyDown={blockManualInput}
          onBeforeInput={(event) => event.preventDefault()}
          onPaste={(event) => event.preventDefault()}
          className={cn(
            "w-full cursor-pointer rounded-2xl border bg-white py-3.5 pr-8 pl-3 text-center font-saans text-lg font-medium text-black-color outline-none transition-colors placeholder:text-light-gray-color/60 focus:border-teal-green-color disabled:cursor-not-allowed disabled:opacity-60",
            hasError ? "border-red-500" : "border-slate-border-color"
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={openOptionsAria(label)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => (isOpen ? onClose() : onOpen())}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-light-gray-color hover:text-black-color disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </div>

      {isOpen && options.length > 0 && (
        <ul
          role="listbox"
          aria-label={optionsAria(label)}
          className="absolute top-[calc(100%+6px)] left-0 z-30 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-border-color bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={fieldValue === option}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(option);
                  onClose();
                }}
                className={cn(
                  "w-full cursor-pointer px-3 py-2 text-center font-saans text-sm text-black-color hover:bg-teal-green-color/10",
                  fieldValue === option && "bg-teal-green-color/10 font-medium"
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function QuizDateAnswer({
  question,
  value,
  onChange,
  disabled = false,
  error = null,
}: QuizDateAnswerProps) {
  const tQuiz = useTranslations("Quiz");
  const config = resolveDatePickerConfig(question);
  const { year, month, day } = parseDateValue(value, config);
  const [touched, setTouched] = useState(false);
  const [openField, setOpenField] = useState<DatePart | null>(null);

  useEffect(() => {
    setTouched(false);
    setOpenField(null);
  }, [question._id]);

  const validation = useMemo(
    () => validateDateAnswer(question, value, tQuiz),
    [question, value, tQuiz]
  );

  const displayError = error ?? (touched ? validation.error : null);
  const showError = Boolean(displayError);

  const yearOptions = useMemo(() => getYearOptions(), []);
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const dayOptions = useMemo(
    () => getDayOptions(year, month),
    [year, month]
  );

  const updatePart = (part: DatePart, next: string) => {
    const maxLength = part === "year" ? 4 : 2;
    const sanitized = sanitizeDigits(next, maxLength);

    let nextParts = {
      year: part === "year" ? sanitized : year,
      month: part === "month" ? sanitized : month,
      day: part === "day" ? sanitized : day,
    };

    if (
      config.allowDay &&
      (part === "year" || part === "month") &&
      nextParts.day &&
      nextParts.year.length === 4 &&
      nextParts.month.length > 0
    ) {
      const maxDay = getDaysInMonth(
        Number(nextParts.year),
        Number(nextParts.month)
      );
      if (Number(nextParts.day) > maxDay) {
        nextParts = { ...nextParts, day: String(maxDay) };
      }
    }

    onChange(buildRawDateValue(nextParts, config));
  };

  const fieldProps = {
    disabled,
    onBlur: () => {
      setTouched(true);
      setOpenField(null);
    },
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div className="flex items-start justify-center gap-3">
        {config.allowYear && (
          <DatePickerField
            id="quiz-date-year"
            label={tQuiz("dateYear")}
            placeholder="0000"
            fieldValue={year}
            options={yearOptions}
            maxLength={4}
            isOpen={openField === "year"}
            hasError={showError && config.allowYear && !year}
            widthClass="w-[92px] sm:w-[100px]"
            onOpen={() => setOpenField("year")}
            onClose={() => setOpenField(null)}
            onChange={(next) => updatePart("year", next)}
            openOptionsAria={(field) =>
              tQuiz("dateOpenOptionsAria", { field })
            }
            optionsAria={(field) => tQuiz("dateOptionsAria", { field })}
            {...fieldProps}
          />
        )}
        {config.allowMonth && (
          <DatePickerField
            id="quiz-date-month"
            label={tQuiz("dateMonth")}
            placeholder="00"
            fieldValue={month}
            options={monthOptions}
            maxLength={2}
            isOpen={openField === "month"}
            hasError={showError && config.allowMonth && !month}
            widthClass="w-[72px] sm:w-[80px]"
            onOpen={() => setOpenField("month")}
            onClose={() => setOpenField(null)}
            onChange={(next) => updatePart("month", next)}
            openOptionsAria={(field) =>
              tQuiz("dateOpenOptionsAria", { field })
            }
            optionsAria={(field) => tQuiz("dateOptionsAria", { field })}
            {...fieldProps}
          />
        )}
        {config.allowDay && (
          <DatePickerField
            id="quiz-date-day"
            label={tQuiz("dateDay")}
            placeholder="00"
            fieldValue={day}
            options={dayOptions}
            maxLength={2}
            isOpen={openField === "day"}
            hasError={showError && config.allowDay && !day}
            widthClass="w-[72px] sm:w-[80px]"
            onOpen={() => setOpenField("day")}
            onClose={() => setOpenField(null)}
            onChange={(next) => updatePart("day", next)}
            openOptionsAria={(field) =>
              tQuiz("dateOpenOptionsAria", { field })
            }
            optionsAria={(field) => tQuiz("dateOptionsAria", { field })}
            {...fieldProps}
          />
        )}
      </div>

      <p
        role={showError ? "alert" : undefined}
        aria-hidden={!showError}
        className={cn(
          "mt-3 min-h-5 text-center font-saans text-sm font-medium leading-5 text-red-600",
          !showError && "invisible"
        )}
      >
        {displayError ?? "\u00A0"}
      </p>
    </div>
  );
}
