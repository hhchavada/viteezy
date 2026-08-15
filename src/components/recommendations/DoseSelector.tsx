"use client";

import { cn } from "@/lib/utils";
import {
  RECOMMENDATION_MAX_DOSAGE,
  RECOMMENDATION_MIN_DOSAGE,
} from "./constants";

interface DoseSelectorProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const stepperButtonText =
  "font-saans text-sm font-semibold leading-none tracking-normal text-[#000000] sm:text-base md:text-[18px]";

const stepperValueText =
  "font-saans text-sm font-semibold leading-none tracking-normal tabular-nums text-[#000000] sm:text-base md:text-[18px]";

function clampDosage(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function DoseSelector({
  value,
  min = RECOMMENDATION_MIN_DOSAGE,
  max = RECOMMENDATION_MAX_DOSAGE,
  disabled = false,
  loading = false,
  className,
  onIncrement,
  onDecrement,
}: DoseSelectorProps) {
  const safeValue = clampDosage(value, min, max);
  const isInteractionDisabled = disabled || loading;
  const canDecrease = !isInteractionDisabled && safeValue > min;
  const canIncrease = !isInteractionDisabled && safeValue < max;

  return (
    <div
      className={cn(
        "relative inline-flex h-9 w-auto shrink-0 overflow-hidden rounded-md border border-[#E3E3DC] bg-white sm:h-10 md:h-11 md:rounded-lg",
        disabled && "opacity-50",
        loading && "pointer-events-none",
        className
      )}
      aria-busy={loading}
    >
      <div
        className={cn(
          "inline-flex h-full w-full",
          loading && "opacity-45"
        )}
      >
        <button
          type="button"
          disabled={!canDecrease}
          onClick={() => onDecrement?.()}
          className={cn(
            "flex h-full w-8 shrink-0 items-center justify-center border-r border-[#E3E3DC] text-[#000000] sm:w-9 md:w-11",
            canDecrease
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-35",
            stepperButtonText
          )}
          aria-label="Decrease dosage"
        >
          −
        </button>

        <div className="relative flex h-full min-w-[2.25rem] shrink-0 items-center justify-center border-r border-[#E3E3DC] px-2 sm:min-w-[2.75rem] sm:px-2.5 md:min-w-[3.25rem] md:px-3">
          <span
            className={cn(
              stepperValueText,
              "transition-opacity duration-150",
              loading && "opacity-0"
            )}
          >
            {safeValue}
          </span>
        </div>

        <button
          type="button"
          disabled={!canIncrease}
          onClick={() => onIncrement?.()}
          className={cn(
            "flex h-full w-8 shrink-0 items-center justify-center text-[#000000] sm:w-9 md:w-11",
            canIncrease
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-35",
            stepperButtonText
          )}
          aria-label="Increase dosage"
        >
          +
        </button>
      </div>

      {loading ? (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-white/55"
          aria-hidden
        >
          <span className="size-3.5 animate-spin rounded-full border-2 border-[#E3E3DC] border-t-black-color sm:size-4" />
        </div>
      ) : null}
    </div>
  );
}
