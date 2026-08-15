import type { Supplement } from "@/types/recommendations";
import { cn, formatCurrencyAmount } from "@/lib/utils";

interface SupplementProductInfoProps {
  supplement: Pick<
    Supplement,
    | "name"
    | "goalLabel"
    | "pillsCount"
    | "originalPrice"
    | "currentPrice"
    | "currency"
    | "description"
    | "removed"
    | "isUserRemoved"
  >;
  currency?: string;
  isRemoved?: boolean;
}

export function SupplementPrice({
  supplement,
  currency,
  isRemoved = false,
}: Pick<SupplementProductInfoProps, "supplement" | "currency" | "isRemoved">) {
  const displayCurrency =
    supplement.currency?.trim() || currency?.trim() || "EUR";
  const showOriginal = supplement.originalPrice > supplement.currentPrice;

  return (
    <div className="flex shrink-0 flex-wrap items-baseline gap-x-1 gap-y-0.5 font-saans text-[11px] leading-none sm:text-xs md:text-sm lg:text-base">
      {showOriginal ? (
        <span
          className={cn(
            "font-normal line-through",
            isRemoved
              ? "text-[9px] text-[#CFCFCF] sm:text-[10px] md:text-[11px]"
              : "text-[#9E9E9E]"
          )}
        >
          {formatCurrencyAmount(supplement.originalPrice, displayCurrency)}
        </span>
      ) : null}
      <span
        className={cn(
          "font-semibold",
          isRemoved ? "text-[#CFCFCF]" : "text-black-color"
        )}
      >
        {formatCurrencyAmount(supplement.currentPrice, displayCurrency)}
      </span>
    </div>
  );
}

export default function SupplementProductInfo({
  supplement,
}: Pick<SupplementProductInfoProps, "supplement">) {
  return (
    <>
      <p className="mt-0.5 font-saans text-[11px] text-[#9E9E9E] sm:mt-1 sm:text-xs md:text-sm">
        {supplement.goalLabel} • {supplement.pillsCount} pills
      </p>

      {supplement.description ? (
        <p className="mt-1.5 font-saans text-xs leading-relaxed text-[#9E9E9E] sm:mt-2 sm:text-sm">
          {supplement.description}
        </p>
      ) : null}
    </>
  );
}
