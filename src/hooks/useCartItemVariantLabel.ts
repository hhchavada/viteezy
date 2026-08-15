"use client";

import { useTranslations } from "next-intl";

type CartVariantType = "STAND_UP_POUCH" | "SACHETS";

function getMonthsFromPlanDays(planDays?: number | null): number {
  if (!planDays) return 1;
  const months = Math.round(planDays / 30);
  return months > 0 ? months : 1;
}

function getPackMonths(planDays?: number | null, capsuleCount?: number | null): number {
  if (Number.isFinite(capsuleCount) && capsuleCount! > 0) {
    const monthsFromCapsules = capsuleCount! / 30;
    return Number.isInteger(monthsFromCapsules)
      ? monthsFromCapsules
      : Number(monthsFromCapsules.toFixed(1));
  }

  return getMonthsFromPlanDays(planDays);
}

export function useCartItemVariantLabel(
  variantType?: CartVariantType,
  options?: {
    planDays?: number | null;
    capsuleCount?: number | null;
    isOneTime?: boolean;
  }
): string | undefined {
  const tCommon = useTranslations("Common");
  const tCart = useTranslations("Cart");

  if (variantType !== "STAND_UP_POUCH" && variantType !== "SACHETS") {
    return undefined;
  }

  const months = getPackMonths(options?.planDays, options?.capsuleCount);
  const monthLabel = months === 1 ? tCart("month") : tCart("months");

  if (variantType === "STAND_UP_POUCH") {
    if (options?.isOneTime) {
      return `${tCommon("standUpPouch")} · ${tCommon("oneTimePurchase")}`;
    }

    return `${tCommon("standUpPouch")} · ${tCart("pack")} ${months} ${monthLabel}`;
  }

  if (options?.isOneTime) {
    return tCommon("oneTimePurchase");
  }

  return `${tCommon("sachets")} · ${tCart("pack")} ${months} ${monthLabel}`;
}
