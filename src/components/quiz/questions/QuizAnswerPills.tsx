"use client";

import { cn } from "@/lib/utils";
import type { QuizAnswerOption } from "@/store/api/types/healthQuiz.types";
import { getLocalizedText, resolveQuizImageUrl } from "./utils";
import Image from "next/image";

interface QuizAnswerPillsProps {
  options: QuizAnswerOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function QuizAnswerPills({
  options,
  selectedValues,
  onSelect,
  disabled = false,
}: QuizAnswerPillsProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 sm:gap-4">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <button
            key={option._id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full cursor-pointer rounded-2xl border bg-white px-6 py-4 font-saans text-base font-medium text-black-color transition-all sm:py-5 sm:text-lg",
              isSelected
                ? "border-teal-green-color shadow-[0_0_0_1px_#1baf9a]"
                : "border-slate-border-color hover:border-teal-green-color/50",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            {getLocalizedText(option.title)}
          </button>
        );
      })}
    </div>
  );
}

export function distributeOptionsIntoRows<T>(options: T[]): T[][] {
  const count = options.length;

  if (count <= 2) {
    return [options];
  }

  if (count === 3) {
    return [options.slice(0, 2), options.slice(2, 3)];
  }

  if (count === 4) {
    return [options.slice(0, 2), options.slice(2, 4)];
  }

  if (count === 5) {
    return [options.slice(0, 3), options.slice(3, 5)];
  }

  if (count === 6) {
    return [options.slice(0, 3), options.slice(3, 6)];
  }

  const rows: T[][] = [];
  let index = 0;

  while (index < count) {
    const remaining = count - index;

    if (remaining === 4) {
      rows.push(options.slice(index, index + 2));
      rows.push(options.slice(index + 2, index + 4));
      break;
    }

    if (remaining === 1 && rows.length > 0) {
      rows[rows.length - 1].push(options[index]);
      break;
    }

    const rowSize = Math.min(3, remaining);
    rows.push(options.slice(index, index + rowSize));
    index += rowSize;
  }

  return rows;
}

function getAnswerCardRowClassName(rowLength: number, totalCount: number): string {
  if (rowLength === 1 && totalCount === 1) {
    return "mx-auto grid w-full max-w-xs grid-cols-1";
  }

  if (rowLength === 1) {
    return "grid w-full grid-cols-2";
  }

  if (rowLength === 2) {
    return "grid w-full grid-cols-2";
  }

  return "grid w-full grid-cols-2 sm:grid-cols-3";
}

type AnswerCardLayout = "mobile-grid" | "mobile-full" | "desktop";

interface QuizAnswerCardsProps {
  options: QuizAnswerOption[];
  selectedValues: string[];
  selectionOrder: string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
  maxSelection?: number;
  disabled?: boolean;
}

function QuizAnswerCard({
  option,
  isSelected,
  selectionIndex,
  multiple,
  disabled,
  onSelect,
  layout = "desktop",
  className,
}: {
  option: QuizAnswerOption;
  isSelected: boolean;
  selectionIndex: number;
  multiple: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
  layout?: AnswerCardLayout;
  className?: string;
}) {
  const imageUrl = resolveQuizImageUrl(option.image);
  const title = getLocalizedText(option.title);
  const subtitle = option.subtitle ? getLocalizedText(option.subtitle) : null;

  const isMobileLayout = layout === "mobile-grid" || layout === "mobile-full";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.value)}
      className={cn(
        "relative flex w-full min-w-0 cursor-pointer flex-col rounded-2xl border bg-white transition-all",
        isMobileLayout
          ? "items-start justify-center px-4 py-4 text-left"
          : "items-center justify-center p-4 text-center sm:p-5",
        layout === "mobile-grid" && "min-h-[148px] sm:min-h-[140px]",
        layout === "mobile-full" && "min-h-[120px]",
        layout === "desktop" && "min-h-[140px]",
        isSelected
          ? "border-teal-green-color shadow-[0_0_0_1px_#1baf9a]"
          : "border-slate-border-color hover:border-teal-green-color/50",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {multiple && isSelected && selectionIndex >= 0 && (
        <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-teal-green-color font-saans text-xs font-semibold text-white">
          {selectionIndex + 1}
        </span>
      )}

      {imageUrl ? (
        <div
          className={cn(
            "relative mb-2 shrink-0",
            isMobileLayout ? "size-10" : "size-11 sm:size-14"
          )}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={cn(
            "mb-2 flex shrink-0 items-center justify-center rounded-full bg-teal-green-color/10",
            isMobileLayout ? "size-10" : "size-11 sm:size-14"
          )}
        >
          <span className="font-saans text-base font-semibold text-teal-green-color sm:text-lg">
            {title.charAt(0)}
          </span>
        </div>
      )}

      <div className="w-full min-w-0">
        <p
          className={cn(
            "line-clamp-2 font-saans text-sm font-semibold leading-snug text-black-color sm:text-base",
            isMobileLayout ? "text-left" : "text-center"
          )}
        >
          {title}
        </p>

        {subtitle ? (
          <p
            className={cn(
              "mt-1 line-clamp-2 font-saans text-xs leading-snug text-light-gray-color sm:text-sm",
              isMobileLayout ? "text-left" : "text-center"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function renderAnswerCard(
  option: QuizAnswerOption,
  props: Omit<QuizAnswerCardsProps, "options">,
  layout: AnswerCardLayout,
  className?: string
) {
  const isSelected = props.selectedValues.includes(option.value);
  const selectionIndex = props.selectionOrder.indexOf(option.value);

  return (
    <QuizAnswerCard
      key={option._id}
      option={option}
      isSelected={isSelected}
      selectionIndex={selectionIndex}
      multiple={props.multiple ?? false}
      disabled={props.disabled ?? false}
      onSelect={props.onSelect}
      layout={layout}
      className={className}
    />
  );
}

export function QuizAnswerCards({
  options,
  selectedValues,
  selectionOrder,
  onSelect,
  multiple = false,
  disabled = false,
}: QuizAnswerCardsProps) {
  const count = options.length;
  const cardProps = {
    selectedValues,
    selectionOrder,
    onSelect,
    multiple,
    disabled,
  };

  if (count === 3) {
    return (
      <>
        <div className="flex w-full max-w-4xl flex-col gap-3 md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {options
              .slice(0, 2)
              .map((option) => renderAnswerCard(option, cardProps, "mobile-grid"))}
          </div>
          {renderAnswerCard(options[2], cardProps, "mobile-full")}
        </div>

        <div className="hidden w-full max-w-4xl grid-cols-3 gap-4 md:grid md:gap-5">
          {options.map((option) => renderAnswerCard(option, cardProps, "desktop"))}
        </div>
      </>
    );
  }

  if (count === 4) {
    return (
      <>
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3 md:hidden">
          {options.map((option) => renderAnswerCard(option, cardProps, "mobile-grid"))}
        </div>

        <div className="hidden w-full max-w-4xl grid-cols-2 gap-4 md:grid md:gap-5">
          {options.map((option) => renderAnswerCard(option, cardProps, "desktop"))}
        </div>
      </>
    );
  }

  const rows = distributeOptionsIntoRows(options);

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 md:gap-5">
      {rows.map((row, rowIndex) => (
        <div
          key={`answer-row-${rowIndex}`}
          className={cn(
            getAnswerCardRowClassName(row.length, count),
            "gap-3 sm:gap-4 md:gap-5"
          )}
        >
          {row.map((option) => {
            const isLoneCardInRow = row.length === 1 && count > 1;

            return renderAnswerCard(
              option,
              cardProps,
              "desktop",
              isLoneCardInRow ? "col-span-2 sm:col-span-1" : undefined
            );
          })}
        </div>
      ))}
    </div>
  );
}
