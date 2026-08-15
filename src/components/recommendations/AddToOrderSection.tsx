"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, PackagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveQuizRecommendationError } from "@/lib/quizAccessError";
import { useAddRecommendationAddonMutation } from "@/store/api/healthQuizApi";
import { AddOnProduct } from "@/types/recommendations";
import { cn, formatCurrencyAmount } from "@/lib/utils";
import RecommendationProductImage from "./RecommendationProductImage";

interface AddToOrderSectionProps {
  products: AddOnProduct[];
  currency?: string;
  recommendationId?: string;
  sessionId?: string | null;
  guestContactEmail?: string | null;
  onAddonError?: (message: string, requiresMagicLinkSignIn?: boolean) => void;
  onUpdatingChange?: (key: string, isUpdating: boolean) => void;
}

export default function AddToOrderSection({
  products,
  currency = "EUR",
  recommendationId,
  sessionId,
  guestContactEmail,
  onAddonError,
  onUpdatingChange,
}: AddToOrderSectionProps) {
  const t = useTranslations("Recommendations");
  const [mutatingProductId, setMutatingProductId] = useState<string | null>(
    null
  );
  const [addRecommendationAddon] = useAddRecommendationAddonMutation();
  const addedCount = useMemo(
    () => products.filter((product) => product.isAdded === true).length,
    [products]
  );

  useEffect(() => {
    const key = "addon";
    onUpdatingChange?.(key, mutatingProductId !== null);

    return () => {
      onUpdatingChange?.(key, false);
    };
  }, [mutatingProductId, onUpdatingChange]);

  const handleAddonAction = useCallback(
    async (product: AddOnProduct) => {
      if (!recommendationId || !sessionId) {
        onAddonError?.(
          "Unable to update this product. Please refresh and try again."
        );
        return;
      }

      const isRemove = product.isAdded === true;
      setMutatingProductId(product.id);

      try {
        await addRecommendationAddon({
          recommendationId,
          productId: product.id,
          sessionId,
          remove: isRemove,
        }).unwrap();
      } catch (error) {
        const resolved = resolveQuizRecommendationError(
          error,
          isRemove
            ? "Failed to remove product. Please try again."
            : "Failed to add product. Please try again.",
          guestContactEmail
        );
        onAddonError?.(resolved.message, resolved.requiresMagicLinkSignIn);
      } finally {
        setMutatingProductId(null);
      }
    },
    [
      addRecommendationAddon,
      guestContactEmail,
      onAddonError,
      recommendationId,
      sessionId,
    ]
  );

  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#E3E3DC] bg-white">
      <div className="border-b border-[#E3E3DC] bg-[#FAFAFA] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#E3E3DC] sm:size-11"
              aria-hidden
            >
              <PackagePlus className="size-5 text-[#23B299]" />
            </div>
            <div>
              <h2 className="font-saans text-base font-semibold text-black-color sm:text-lg md:text-xl">
                {t("addOnsTitle")}
              </h2>
              <p className="mt-0.5 font-saans text-xs leading-snug text-[#7A7A7A] sm:text-sm">
                {t("addOnsSubtitle")}
              </p>
            </div>
          </div>

          {addedCount > 0 ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#23B299] px-3 py-1 font-saans text-xs font-medium text-white shadow-sm sm:ml-4 sm:shrink-0 sm:text-sm">
              <Check className="size-3.5 shrink-0" aria-hidden />
              {t("addOnsAddedCount", { count: addedCount })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        {products.map((product) => {
          const isDisabled = product.disabled === true;
          const isAdded = product.isAdded === true;
          const isMutating = mutatingProductId === product.id;

          return (
            <article
              key={product.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border px-3 py-3 transition-colors duration-200 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4",
                isAdded
                  ? "border-[#23B299] bg-[#F6FBFA]"
                  : "border-[#E3E3DC] bg-white hover:border-[#D5D5CE]",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
              aria-disabled={isDisabled}
            >

              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div className="relative size-14 overflow-hidden rounded-xl bg-[#F0F0F0] sm:size-16 md:size-[72px]">
                    <RecommendationProductImage
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-saans text-sm font-semibold leading-snug text-black-color sm:text-base">
                      {product.name}
                    </p>
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#23B299]/25 bg-white px-2.5 py-0.5 font-saans text-[11px] font-medium text-[#23B299] sm:text-xs">
                        <Check className="size-3 shrink-0" aria-hidden />
                        {t("addOnsAddedBadge")}
                      </span>
                    ) : null}
                  </div>
                  {product.description ? (
                    <p className="mt-1 font-saans text-xs leading-snug text-[#9E9E9E] sm:text-sm">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="mt-1.5 flex flex-wrap items-baseline gap-1.5 font-saans text-xs sm:text-sm">
                    {product.originalPrice != null &&
                    product.originalPrice > product.price ? (
                      <span className="font-normal text-[#9E9E9E] line-through">
                        {formatCurrencyAmount(
                          product.originalPrice,
                          product.currency || currency
                        )}
                      </span>
                    ) : null}
                    <span className="font-semibold text-black-color">
                      {formatCurrencyAmount(
                        product.price,
                        product.currency || currency
                      )}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={
                  isDisabled || isMutating || mutatingProductId !== null
                }
                onClick={() => void handleAddonAction(product)}
                className={cn(
                  "w-full shrink-0 cursor-pointer rounded-full px-5 py-2 font-saans text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed sm:w-auto sm:self-center sm:px-6 sm:py-2.5",
                  isAdded
                    ? "border border-[#CFCFCF] bg-white text-[#7A7A7A] hover:border-[#E57373] hover:bg-[#FFF5F5] hover:text-[#C62828] disabled:border-[#CFCFCF] disabled:bg-white disabled:text-[#9E9E9E] disabled:hover:bg-white disabled:hover:text-[#9E9E9E]"
                    : "border border-[#23B299] bg-[#23B299] text-white shadow-sm hover:bg-[#1fa389] hover:shadow disabled:border-[#CFCFCF] disabled:bg-[#CFCFCF] disabled:text-[#9E9E9E] disabled:shadow-none"
                )}
              >
                {isMutating
                  ? isAdded
                    ? t("addOnsRemoving")
                    : t("addOnsAdding")
                  : isAdded
                    ? t("addOnsRemoveButton")
                    : t("addOnsAddButton")}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
