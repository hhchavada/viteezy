"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { QuizGoal } from "@/store/api/types/healthQuiz.types";
import { resolveQuizImageUrl } from "./utils";

interface QuizGoalSelectionProps {
  goals: QuizGoal[];
  selectedGoalIds: string[];
  maxSelection?: number;
  disabled?: boolean;
  onToggleGoal: (goalId: string) => void;
}

function GoalSelectionBadge({
  isSelected,
  selectionIndex,
  className,
}: {
  isSelected: boolean;
  selectionIndex: number;
  className?: string;
}) {
  if (!isSelected || selectionIndex < 0) return null;

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-teal-green-color font-saans text-xs font-semibold text-white",
        className
      )}
    >
      {selectionIndex + 1}
    </span>
  );
}

function GoalCardMobile({
  goal,
  isSelected,
  selectionIndex,
  disabled,
  onToggle,
}: {
  goal: QuizGoal;
  isSelected: boolean;
  selectionIndex: number;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const iconUrl = resolveQuizImageUrl(goal.icon);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative flex min-h-[72px] w-full min-w-0 cursor-pointer items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 text-left shadow-sm transition-all",
        isSelected
          ? "border-teal-green-color shadow-[0_0_0_1px_#1baf9a]"
          : "border-slate-border-color hover:border-teal-green-color/50",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      {isSelected && selectionIndex >= 0 ? (
        <GoalSelectionBadge
          isSelected={isSelected}
          selectionIndex={selectionIndex}
          className="absolute top-2 right-2 size-6"
        />
      ) : null}

      {iconUrl ? (
        <div className="relative size-8 shrink-0 self-center">
          <Image
            src={iconUrl}
            alt={goal.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center self-center rounded-full bg-teal-green-color/10">
          <span className="font-saans text-sm font-semibold text-teal-green-color">
            {goal.title.charAt(0)}
          </span>
        </div>
      )}

      <p
        className={cn(
          "line-clamp-2 min-w-0 flex-1 self-center break-words text-left font-saans text-sm font-medium leading-snug text-black-color",
          isSelected ? "pr-6" : "pr-0"
        )}
      >
        {goal.title}
      </p>
    </button>
  );
}

function GoalCardDesktop({
  goal,
  isSelected,
  selectionIndex,
  disabled,
  onToggle,
}: {
  goal: QuizGoal;
  isSelected: boolean;
  selectionIndex: number;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const iconUrl = resolveQuizImageUrl(goal.icon);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative flex h-[108px] w-[108px] cursor-pointer flex-col items-center justify-center rounded-2xl border bg-white px-2 py-3 text-center shadow-sm transition-all sm:h-[118px] sm:w-[118px] md:h-[124px] md:w-[124px]",
        isSelected
          ? "border-teal-green-color shadow-[0_0_0_1px_#1baf9a]"
          : "border-slate-border-color hover:border-teal-green-color/50",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <GoalSelectionBadge
        isSelected={isSelected}
        selectionIndex={selectionIndex}
        className="absolute top-2.5 right-2.5 size-6"
      />

      {iconUrl ? (
        <div className="relative mb-2 size-10 sm:size-11">
          <Image
            src={iconUrl}
            alt={goal.title}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-teal-green-color/10 sm:size-11">
          <span className="font-saans text-base font-semibold text-teal-green-color">
            {goal.title.charAt(0)}
          </span>
        </div>
      )}

      <p className="line-clamp-2 font-saans text-xs font-medium leading-tight text-black-color sm:text-sm">
        {goal.title}
      </p>
    </button>
  );
}

export default function QuizGoalSelection({
  goals,
  selectedGoalIds,
  maxSelection = 7,
  disabled = false,
  onToggleGoal,
}: QuizGoalSelectionProps) {
  return (
    <>
      <div className="grid w-full max-w-4xl grid-cols-2 gap-3 md:hidden">
        {goals.map((goal) => {
          const isSelected = selectedGoalIds.includes(goal._id);
          const selectionIndex = selectedGoalIds.indexOf(goal._id);
          const atMax = selectedGoalIds.length >= maxSelection;
          const isDisabled = disabled || (atMax && !isSelected);

          return (
            <GoalCardMobile
              key={goal._id}
              goal={goal}
              isSelected={isSelected}
              selectionIndex={selectionIndex}
              disabled={isDisabled}
              onToggle={() => onToggleGoal(goal._id)}
            />
          );
        })}
      </div>

      <div className="hidden w-full max-w-4xl flex-wrap items-center justify-center gap-3 sm:gap-4 md:flex">
        {goals.map((goal) => {
          const isSelected = selectedGoalIds.includes(goal._id);
          const selectionIndex = selectedGoalIds.indexOf(goal._id);
          const atMax = selectedGoalIds.length >= maxSelection;
          const isDisabled = disabled || (atMax && !isSelected);

          return (
            <GoalCardDesktop
              key={goal._id}
              goal={goal}
              isSelected={isSelected}
              selectionIndex={selectionIndex}
              disabled={isDisabled}
              onToggle={() => onToggleGoal(goal._id)}
            />
          );
        })}
      </div>
    </>
  );
}

export function QuizGoalSelectionHeading({
  maxSelection = 7,
}: {
  maxSelection?: number;
}) {
  const tQuiz = useTranslations("Quiz");

  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      <h1 className="font-saans text-2xl font-medium leading-tight text-black-color sm:text-3xl md:text-4xl">
        {tQuiz("goalsHeading")}
      </h1>
      <p className="mt-3 font-saans text-sm text-light-gray-color sm:text-base">
        {tQuiz("goalsSubheading", { maxSelection })}
      </p>
    </div>
  );
}
