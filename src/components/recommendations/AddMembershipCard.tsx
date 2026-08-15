"use client";

import { useState } from "react";
import { formatCurrencyAmount, hasAuthToken } from "@/lib/utils";
import type { MembershipOption, MembershipSectionData } from "@/types/recommendations";
import MembershipPaymentDialog from "@/components/membership/MembershipPaymentDialog";
import MembershipBadge from "./MembershipBadge";

interface AddMembershipCardProps {
  membership: MembershipSectionData;
  onMembershipPurchased?: () => void;
  onLoginRequired?: () => void;
}

function formatExpiryDate(isoDate: string): string {
  if (!isoDate) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export default function AddMembershipCard({
  membership,
  onMembershipPurchased,
  onLoginRequired,
}: AddMembershipCardProps) {
  const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleAddPlan = (plan: MembershipOption) => {
    if (!hasAuthToken()) {
      onLoginRequired?.();
      return;
    }

    setPaymentPlanId(plan.id);
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setPaymentPlanId(null);
  };

  const handlePurchaseSuccess = () => {
    onMembershipPurchased?.();
  };

  const { activeMembership, hasActiveMembership, plans, subtitle, title } =
    membership;

  const upgradePlans = hasActiveMembership
    ? plans.filter((plan) => plan.id !== activeMembership?.planId)
    : plans;

  const sectionTitle = hasActiveMembership ? "Your Membership" : title;
  const sectionSubtitle = hasActiveMembership
    ? "You are currently enrolled in a membership plan."
    : subtitle;

  return (
    <>
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-7">
      <h2 className="font-saans text-xl font-semibold text-black-color">
        {sectionTitle}
      </h2>
      <p className="mt-1 font-saans text-sm leading-5 text-light-gray-color sm:text-[15px]">
        {sectionSubtitle}
      </p>

      <div className="mt-5 border-t border-[#E5E5E5]" />

      {hasActiveMembership && activeMembership ? (
        <div className="mt-5 rounded-xl bg-[#F7F6F0] p-4 sm:p-5">
          <p className="font-saans text-xs font-medium uppercase tracking-wide text-light-gray-color">
            Your active membership
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-saans text-base font-semibold text-black-color">
              {activeMembership.name}
            </span>
            {activeMembership.savingsBadge && (
              <MembershipBadge text={activeMembership.savingsBadge} />
            )}
          </div>
          <p className="mt-1 font-saans text-sm text-light-gray-color">
            {activeMembership.label}
            {activeMembership.interval &&
            activeMembership.interval !== activeMembership.label
              ? ` · ${activeMembership.interval}`
              : ""}
          </p>
          <p className="mt-2 font-saans text-sm font-semibold text-black-color">
            {formatCurrencyAmount(
              activeMembership.price,
              activeMembership.currency
            )}
          </p>
          {activeMembership.expiresAt && (
            <p className="mt-1 font-saans text-sm text-light-gray-color">
              Renews on {formatExpiryDate(activeMembership.expiresAt)}
            </p>
          )}
          {activeMembership.benefits.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {activeMembership.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="font-saans text-sm text-black-color before:mr-2 before:content-['•']"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-5 font-saans text-sm text-light-gray-color">
          Add a membership to unlock discounts, free shipping, and member perks.
        </p>
      )}

      {upgradePlans.length > 0 && (
        <div className="mt-5 space-y-5">
          {hasActiveMembership && (
            <p className="font-saans text-sm font-medium text-black-color">
              {upgradePlans.some((plan) => plan.isBestValue)
                ? "Upgrade your plan"
                : "Other membership options"}
            </p>
          )}

          {upgradePlans.map((option) => (
              <div
                key={option.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-saans text-sm font-semibold text-black-color">
                      {option.label}
                    </span>
                    {option.badge && <MembershipBadge text={option.badge} />}
                  </div>
                  {option.name !== option.label && (
                    <p className="mt-0.5 font-saans text-sm text-light-gray-color">
                      {option.name}
                    </p>
                  )}
                  <p className="mt-0.5 font-saans text-sm font-semibold text-black-color">
                    {formatCurrencyAmount(option.price, option.currency)}
                  </p>
                  {option.shortDescription && (
                    <p className="mt-1 font-saans text-xs text-light-gray-color">
                      {option.shortDescription}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddPlan(option)}
                  className="shrink-0 cursor-pointer font-saans text-lg font-semibold text-black-color hover:text-[#23B299]"
                >
                  +Add
                </button>
              </div>
            ))}
        </div>
      )}
      </div>

      <MembershipPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        planId={paymentPlanId}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  );
}
