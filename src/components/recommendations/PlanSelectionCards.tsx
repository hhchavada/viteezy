import { cn, formatCurrencyAmount } from "@/lib/utils";
import type { PlanSummary, PlanTier } from "@/types/recommendations";
import PlanNotice from "./PlanNotice";

interface PlanSelectionCardsProps {
  activeTier: PlanTier;
  onTierChange: (tier: PlanTier) => void;
  essential: PlanSummary;
  advanced: PlanSummary;
  noticeMessage?: string;
  /** Overrides "per month" (subscription-change flow only). */
  pricePeriodLabel?: string;
}

const planTitleText =
  "font-saans text-base font-semibold leading-tight tracking-normal text-black-color capitalize sm:text-[18px] sm:leading-none";

const planMetaText =
  "mt-1 font-saans text-xs font-normal leading-snug text-[#9E9E9E] sm:text-sm";

const planNamesText =
  "font-saans text-xs font-medium leading-snug tracking-normal text-[#4A4A4A] sm:text-sm sm:leading-snug md:text-base";

const planPriceText =
  "font-saans text-base font-semibold leading-none tracking-normal text-black-color sm:text-[18px]";

const planPriceMetaText =
  "mt-1 font-saans text-xs font-normal leading-none text-[#9E9E9E] sm:text-sm";

type PlanOptionProps = {
  title: string;
  summary: PlanSummary;
  isActive: boolean;
  onSelect: () => void;
  pricePeriodLabel: string;
};

function PlanOption({
  title,
  summary,
  isActive,
  onSelect,
  pricePeriodLabel,
}: PlanOptionProps) {
  const namesLabel = summary.supplementNames.join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-colors sm:gap-4 sm:p-5 md:gap-5 md:p-6",
        isActive
          ? "border-[#23B299] bg-[#23B299] hover:bg-[#1fa389]"
          : "border-[#E3E3DC] bg-white hover:bg-[#FAFAFA]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full sm:size-5",
          isActive ? "border-2 border-white" : "border border-black-color"
        )}
        aria-hidden
      >
        {isActive ? (
          <span className="size-2 rounded-full bg-white sm:size-2.5" />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p
              className={cn(
                planTitleText,
                isActive && "text-white"
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                planMetaText,
                isActive && "text-white/80"
              )}
            >
              {summary.supplementCount} Supplements • {summary.pillsPerDay}{" "}
              pills/day
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className={cn(
                planPriceText,
                isActive && "text-white"
              )}
            >
              {formatCurrencyAmount(summary.monthlyPrice, summary.currency)}
            </p>
            <p
              className={cn(
                planPriceMetaText,
                isActive && "text-white/80"
              )}
            >
              {pricePeriodLabel}
            </p>
          </div>
        </div>

        {namesLabel ? (
          <p
            className={cn(
              "mt-2 sm:mt-2.5",
              planNamesText,
              isActive && "text-white/90"
            )}
          >
            {namesLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export default function PlanSelectionCards({
  activeTier,
  onTierChange,
  essential,
  advanced,
  noticeMessage,
  pricePeriodLabel = "per month",
}: PlanSelectionCardsProps) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-5 sm:gap-4 sm:px-6 sm:pt-6 sm:pb-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        <PlanOption
          title="Essential"
          summary={essential}
          isActive={activeTier === "essential"}
          onSelect={() => onTierChange("essential")}
          pricePeriodLabel={pricePeriodLabel}
        />
        <PlanOption
          title="Advanced"
          summary={advanced}
          isActive={activeTier === "advanced"}
          onSelect={() => onTierChange("advanced")}
          pricePeriodLabel={pricePeriodLabel}
        />
      </div>

      {noticeMessage ? <PlanNotice message={noticeMessage} /> : null}
    </div>
  );
}
