import React from "react";
import { Subscription } from "@/store/api/types/subsciption.types";
import { subscriptionStatus } from "@/components/constants/subscription";
import PlanHistoryCard from "./PlanHistoryCard";
import { useTranslations } from "next-intl";

interface PlanHistoryTabProps {
  subscription: Subscription;
}

export default function PlanHistoryTab({ subscription }: PlanHistoryTabProps) {
  const t = useTranslations("Account");
  const planLabel = subscription.cycleDays === 1
    ? t("subscriptionOneDayPlan", { days: 1 })
    : t("subscriptionManyDaysPlan", { days: subscription.cycleDays });
  const displayTotal =
    subscription.orderId?.grandTotal ??
    subscription.items?.reduce((sum, i) => sum + (i?.totalAmount ?? 0), 0) ??
    0;
  const amountLabel = `$${
    typeof displayTotal === "number" ? displayTotal.toFixed(2) : displayTotal
  } ${subscription.cycleDays === 1
    ? t("subscriptionPerOneDay", { days: 1 })
    : t("subscriptionPerManyDays", { days: subscription.cycleDays })}`;

  const isActive = subscription.status === subscriptionStatus.active;
  const isCancelled = subscription.status === subscriptionStatus.cancelled;
  const isPaused =
    subscription.status?.toLowerCase() === "paused" ||
    subscription.status === "Paused";

  const currentStatus: "Active" | "Cancelled" | "Paused" = isActive
    ? "Active"
    : isCancelled
    ? "Cancelled"
    : isPaused
    ? "Paused"
    : "Active";

  return (
    <div className="space-y-5">
      <PlanHistoryCard
        status={currentStatus}
        planLabel={planLabel}
        startDate={subscription.subscriptionStartDate}
        nextBillingDate={subscription.nextBillingDate}
        cancelDate={subscription.cancelledAt}
        pauseDate={subscription.pausedAt}
        amountLabel={amountLabel}
        reason={
          subscription.cancellationReason ||
          (isPaused ? t("pausedByUser") : undefined)
        }
      />
    </div>
  );
}
