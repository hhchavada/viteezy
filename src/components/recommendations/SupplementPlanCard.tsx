"use client";

import type {
  AddOnProduct,
  PlanSummary,
  PlanTier,
  Supplement,
} from "@/types/recommendations";
import PlanSelectionCards from "./PlanSelectionCards";
import SupplementRow from "./SupplementRow";
import AddToOrderSection from "./AddToOrderSection";
import { countActiveBundleSupplements } from "./constants";

interface SupplementPlanCardProps {
  activeTier: PlanTier;
  onTierChange: (tier: PlanTier) => void;
  essentialSupplements: Supplement[];
  advancedSupplements: Supplement[];
  essentialPlan: PlanSummary;
  advancedPlan: PlanSummary;
  noticeMessage: string;
  addOnProducts: AddOnProduct[];
  currency?: string;
  recommendationId?: string;
  sessionId?: string | null;
  guestContactEmail?: string | null;
  onDosageError?: (message: string, requiresMagicLinkSignIn?: boolean) => void;
  onRecommendationUpdatingChange?: (key: string, isUpdating: boolean) => void;
  hideAddOns?: boolean;
  /** Overrides plan card "per month" label (subscription-change flow). */
  pricePeriodLabel?: string;
}

export default function SupplementPlanCard({
  activeTier,
  onTierChange,
  essentialSupplements,
  advancedSupplements,
  essentialPlan,
  advancedPlan,
  noticeMessage,
  addOnProducts,
  currency = "EUR",
  recommendationId,
  sessionId,
  guestContactEmail,
  onDosageError,
  onRecommendationUpdatingChange,
  hideAddOns = false,
  pricePeriodLabel,
}: SupplementPlanCardProps) {
  const isEssential = activeTier === "essential";
  const supplements = isEssential ? essentialSupplements : advancedSupplements;
  const activeBundleProductCount = countActiveBundleSupplements(supplements);
  const sectionTitle = isEssential ? "The Essentials" : "Advanced Plan";

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="overflow-hidden rounded-xl border border-[#E3E3DC] bg-white">
        <PlanSelectionCards
          activeTier={activeTier}
          onTierChange={onTierChange}
          essential={essentialPlan}
          advanced={advancedPlan}
          noticeMessage={noticeMessage}
          pricePeriodLabel={pricePeriodLabel}
        />

        <div className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <h2 className="font-saans text-lg font-semibold text-black-color sm:text-xl md:text-2xl">
            {sectionTitle}
          </h2>
          <p className="mt-1 font-saans text-xs text-[#9E9E9E] sm:text-sm">
            {activeBundleProductCount} Supplements
          </p>

          <div className="mt-3 sm:mt-4">
            {supplements.length > 0 ? (
              supplements.map((supplement) => (
                <SupplementRow
                  key={supplement.id}
                  supplement={supplement}
                  currency={currency}
                  recommendationId={recommendationId}
                  sessionId={sessionId}
                  guestContactEmail={guestContactEmail}
                  onDosageError={onDosageError}
                  updatingKey={`supplement:${supplement.id}`}
                  onUpdatingChange={onRecommendationUpdatingChange}
                />
              ))
            ) : (
              <p className="py-6 text-center font-saans text-sm text-[#9E9E9E]">
                No supplements in this plan.
              </p>
            )}
          </div>
        </div>
      </div>

      {!hideAddOns ? (
        <AddToOrderSection
          products={addOnProducts}
          currency={currency}
          recommendationId={recommendationId}
          sessionId={sessionId}
          guestContactEmail={guestContactEmail}
          onAddonError={onDosageError}
          onUpdatingChange={onRecommendationUpdatingChange}
        />
      ) : null}
    </div>
  );
}
