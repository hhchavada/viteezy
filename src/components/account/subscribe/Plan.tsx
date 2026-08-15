"use client";

import {
  subscriptionStatus,
  subscriptionStatusBadgeClass,
} from "@/components/constants/subscription";
import { Button } from "@/components/ui/button";
import { formatDateWithTranslation, getCurrencySymbol } from "@/lib/utils";
import { Subscription } from "@/store/api/types/subsciption.types";
import { InfoIcon } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

interface PlanProps {
  data: Subscription;
  mode?: "list" | "details";
  onViewDetails?: (subscriptionId: string) => void;
  handleCancelPlan?: () => void;
  handlePausePlan?: () => void;
  handleRestartPlan?: () => void;
}

const Plan = ({
  data,
  mode = "details",
  onViewDetails,
  handleCancelPlan,
  handlePausePlan,
  handleRestartPlan,
}: PlanProps) => {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const noManagableDays = -1;
  const isActive = data?.status === subscriptionStatus.active;
  const isCancelled = data?.status === subscriptionStatus.cancelled;
  const isPaused =
    data?.status?.toLowerCase() === "paused" || data?.status === "Paused";
  const currentStatus: "Active" | "Cancelled" | "Paused" = isActive
    ? "Active"
    : isCancelled
      ? "Cancelled"
      : isPaused
        ? "Paused"
        : "Active";
  const statusLabel =
    currentStatus === "Active"
      ? t("subscriptionStatusActive")
      : currentStatus === "Cancelled"
        ? t("subscriptionStatusCancelled")
        : t("subscriptionStatusPaused");
  const relation = (data?.subscriptionRelation || "self").toLowerCase();
  const relationLabel =
    relation === "family"
      ? t("subscriptionRelationFamily")
      : t("subscriptionRelationSelf");
  const showRestartButton = isCancelled;
  const isNoManagablePlan =
    data?.cycleDays === noManagableDays && !showRestartButton;
  const showManageButtons = isActive && !isNoManagablePlan;
  const noManageSubscription =
    !showManageButtons && !showRestartButton && isActive && isNoManagablePlan;

  const displayTotal =
    data?.orderId?.grandTotal ??
    data?.items?.reduce((sum, i) => sum + (i?.totalAmount ?? 0), 0) ??
    0;

  const cycleDays = data?.cycleDays ?? 0;
  const currencySymbol = getCurrencySymbol(data?.currency);

  return (
    <div
      className={` radius  ${
        isNoManagablePlan
          ? "border border-gains-light-boro"
          : "bg-slate-50-color"
      } flex flex-col justify-between overflow-hidden`}
    >
      <div className="p-4.5">
        <div>
          {/* Current Plan Status */}
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="text-lg font-medium text-gray-700">
              {t("subscriptionCurrentPlan")}
            </span>
            <span
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-md ${
                subscriptionStatusBadgeClass[currentStatus] ??
                "bg-gray-500 text-white"
              }`}
            >
              {statusLabel}
            </span>
            <span
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-md ${
                relation === "family"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {relationLabel}
            </span>
          </div>

          {/* Plan Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {cycleDays === 1
              ? t("subscriptionOneDayPlan", { days: 1 })
              : t("subscriptionManyDaysPlan", { days: cycleDays })}
          </h3>

          {/* Price */}
          <div className="">
            <span className="text-[34px] font-semibold text-gray-900 leading-tight">
              {currencySymbol}
              {typeof displayTotal === "number"
                ? displayTotal.toFixed(2)
                : displayTotal}
              <span className="text-xl font-semibold">
                {" "}
                {cycleDays === 1
                  ? t("subscriptionPerOneDay", { days: 1 })
                  : t("subscriptionPerManyDays", { days: cycleDays })}
              </span>
            </span>
          </div>

          {/* Renewal Date */}
          {!isNoManagablePlan && (
            <p className="text-md text-slightly-gray mt-4">
              {t("planRenewsOn", { date: formatDateWithTranslation(data?.nextBillingDate || "", "DD MMM YYYY", tMonths) })}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="">
          {mode === "list" && onViewDetails && (
            <div className="flex gap-2.5 mt-9">
              <Button
                variant="elevate"
                size="elevate-md"
                className="flex-1 font-semibold"
                onClick={() => onViewDetails(data?.id)}
                animateText
              >
                {t("viewDetails")}
              </Button>
            </div>
          )}

          {mode === "details" && showManageButtons && handleCancelPlan && handlePausePlan && (
            <div className="flex gap-2.5 mt-9">
              <Button
                variant="elevate"
                size="elevate-md"
                className="flex-1 font-semibold bg-coral-red!"
                onClick={handleCancelPlan}
                animateText
              >
                {t("cancelPlan")}
              </Button>
              <Button
                variant="elevate"
                size="elevate-md"
                className="flex-1 font-semibold"
                onClick={handlePausePlan}
                animateText
              >
                {t("pausePlan")}
              </Button>
            </div>
          )}

          {mode === "details" && showRestartButton && handleRestartPlan && (
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold mt-9"
              onClick={handleRestartPlan}
              animateText
            >
              {t("restartPlan")}
            </Button>
          )}
        </div>
      </div>
      {noManageSubscription && (
        <p className="text-sm text-concord font-medium text-center w-full bg-white-smoke flex justify-center items-center p-3 gap-2">
          <InfoIcon className="w-5 h-5" />
          {t("cancellationNotAvailablePlan")}
        </p>
      )}
    </div>
  );
};

export default Plan;
