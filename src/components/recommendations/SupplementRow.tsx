"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveQuizRecommendationError } from "@/lib/quizAccessError";
import { cn } from "@/lib/utils";
import {
  useUpdateRecommendationPillQuantityMutation,
  useUpdateRecommendationProductVisibilityMutation,
} from "@/store/api/healthQuizApi";
import type { Supplement } from "@/types/recommendations";
import {
  RECOMMENDATION_MAX_DOSAGE,
  RECOMMENDATION_MIN_DOSAGE,
} from "./constants";
import DoseSelector from "./DoseSelector";
import RecommendationProductImage from "./RecommendationProductImage";
import SupplementProductInfo, { SupplementPrice } from "./SupplementProductInfo";

interface SupplementRowProps {
  supplement: Supplement;
  currency?: string;
  recommendationId?: string;
  sessionId?: string | null;
  guestContactEmail?: string | null;
  onDosageError?: (message: string, requiresMagicLinkSignIn?: boolean) => void;
  updatingKey?: string;
  onUpdatingChange?: (key: string, isUpdating: boolean) => void;
}

export default function SupplementRow({
  supplement,
  currency = "EUR",
  recommendationId,
  sessionId,
  guestContactEmail,
  onDosageError,
  updatingKey,
  onUpdatingChange,
}: SupplementRowProps) {
  const t = useTranslations("Recommendations");

  const clampDosage = (value: number) =>
    Math.min(
      RECOMMENDATION_MAX_DOSAGE,
      Math.max(RECOMMENDATION_MIN_DOSAGE, value)
    );

  const [dosage, setDosage] = useState(() => clampDosage(supplement.dosage));
  const [updatePillQuantity, { isLoading: isUpdatingDosage }] =
    useUpdateRecommendationPillQuantityMutation();
  const [updateProductVisibility, { isLoading: isUpdatingVisibility }] =
    useUpdateRecommendationProductVisibilityMutation();

  const isDisabled = supplement.disabled === true;
  const isRemoved =
    supplement.isUserRemoved === true || supplement.removed === true;
  const isDosageLocked = isDisabled || isRemoved;
  const isMutating = isUpdatingDosage || isUpdatingVisibility;

  useEffect(() => {
    setDosage(clampDosage(supplement.dosage));
  }, [supplement.dosage, supplement.id]);

  useEffect(() => {
    if (!updatingKey) return;

    onUpdatingChange?.(updatingKey, isMutating);

    return () => {
      onUpdatingChange?.(updatingKey, false);
    };
  }, [isMutating, onUpdatingChange, updatingKey]);

  const adjustDosage = useCallback(
    async (action: "increment" | "decrement") => {
      if (isDosageLocked || isUpdatingDosage) return;

      if (!recommendationId || !sessionId) {
        onDosageError?.(t("dosageUpdateUnavailable"));
        return;
      }

      if (action === "increment" && dosage >= RECOMMENDATION_MAX_DOSAGE) return;
      if (action === "decrement" && dosage <= RECOMMENDATION_MIN_DOSAGE) return;

      try {
        await updatePillQuantity({
          recommendationId,
          productId: supplement.id,
          action,
          sessionId: sessionId ?? recommendationId,
        }).unwrap();
      } catch (error) {
        const resolved = resolveQuizRecommendationError(
          error,
          t("dosageUpdateFailed"),
          guestContactEmail
        );
        onDosageError?.(resolved.message, resolved.requiresMagicLinkSignIn);
      }
    },
    [
      isDosageLocked,
      isUpdatingDosage,
      recommendationId,
      sessionId,
      dosage,
      supplement.id,
      guestContactEmail,
      updatePillQuantity,
      onDosageError,
      t,
    ]
  );

  const toggleVisibility = useCallback(async () => {
    if (isDisabled || isUpdatingVisibility) return;

    if (!recommendationId || !sessionId) {
      onDosageError?.(t("visibilityUpdateUnavailable"));
      return;
    }

    const nextRemoved = !isRemoved;

    try {
      await updateProductVisibility({
        recommendationId,
        productId: supplement.id,
        removed: nextRemoved,
        sessionId: sessionId ?? recommendationId,
      }).unwrap();
    } catch (error) {
      const resolved = resolveQuizRecommendationError(
        error,
        nextRemoved ? t("visibilityRemoveFailed") : t("visibilityUndoFailed"),
        guestContactEmail
      );
      onDosageError?.(resolved.message, resolved.requiresMagicLinkSignIn);
    }
  }, [
    isDisabled,
    isUpdatingVisibility,
    isRemoved,
    recommendationId,
    sessionId,
    supplement.id,
    guestContactEmail,
    updateProductVisibility,
    onDosageError,
    t,
  ]);

  return (
    <div
      className={cn(
        "border-b border-[#E3E3DC] py-3 last:border-b-0 sm:py-4 md:py-5",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      aria-disabled={isDisabled}
    >
      <div className="flex items-start gap-2.5 sm:gap-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#F0F0F0] sm:size-14 sm:rounded-xl md:size-16 lg:size-[72px]">
          <RecommendationProductImage
            src={supplement.imageUrl}
            alt={supplement.name}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3
              className={cn(
                "line-clamp-2 min-w-0 font-saans text-[13px] font-semibold leading-snug sm:flex-1 sm:text-sm md:text-base lg:text-[17px]",
                isRemoved ? "text-[#CFCFCF]" : "text-black-color"
              )}
            >
              {supplement.name}
            </h3>
            <SupplementPrice
              supplement={supplement}
              currency={currency}
              isRemoved={isRemoved}
            />
          </div>

          <SupplementProductInfo supplement={supplement} />

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3 sm:gap-3 md:mt-4">
            <div
              className={cn(isRemoved && "pointer-events-none opacity-40")}
              aria-hidden={isRemoved}
            >
              <DoseSelector
                value={dosage}
                min={RECOMMENDATION_MIN_DOSAGE}
                max={RECOMMENDATION_MAX_DOSAGE}
                disabled={isDosageLocked}
                loading={isUpdatingDosage && !isRemoved}
                onIncrement={() => void adjustDosage("increment")}
                onDecrement={() => void adjustDosage("decrement")}
              />
            </div>

            {!isDisabled ? (
              <button
                type="button"
                disabled={isUpdatingVisibility}
                onClick={() => void toggleVisibility()}
                aria-label={
                  isRemoved ? t("supplementUndo") : t("supplementRemove")
                }
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 font-saans text-xs font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:border-[#CFCFCF] disabled:bg-[#F5F5F5] disabled:text-[#9E9E9E] disabled:shadow-none sm:gap-2 sm:px-5 sm:py-2 sm:text-sm",
                  isRemoved
                    ? "border-[#23B299] bg-[#23B299] text-white hover:bg-[#1a9a84] hover:border-[#1a9a84]"
                    : "border-black-color bg-white text-black-color hover:bg-black-color hover:text-white"
                )}
              >
                {isUpdatingVisibility ? (
                  <>
                    <Loader2
                      className="size-3.5 shrink-0 animate-spin sm:size-4"
                      aria-hidden
                    />
                    <span>
                      {isRemoved
                        ? t("supplementRestoring")
                        : t("supplementRemoving")}
                    </span>
                  </>
                ) : isRemoved ? (
                  <>
                    <Undo2
                      className="size-3.5 shrink-0 sm:size-4"
                      aria-hidden
                    />
                    <span>{t("supplementUndo")}</span>
                  </>
                ) : (
                  <>
                    <Trash2
                      className="size-3.5 shrink-0 sm:size-4"
                      aria-hidden
                    />
                    <span>{t("supplementRemove")}</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
