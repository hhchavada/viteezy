"use client";

import { formatDateWithTranslation } from "@/lib/utils";
import { subscriptionStatusBadgeClass } from "@/components/constants/subscription";
import { memo, useMemo } from "react";
import DetailCard from "../DetailCard";
import { useTranslations } from "next-intl";

function PlanHistoryCard({
  status,
  planLabel,
  startDate,
  nextBillingDate,
  cancelDate,
  pauseDate,
  amountLabel,
  reason,
}: {
  status: "Active" | "Cancelled" | "Paused";
  planLabel: string;
  startDate: string;
  nextBillingDate?: string | null;
  cancelDate?: string | null;
  pauseDate?: string | null;
  amountLabel: string;
  reason?: string | null;
}) {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const rows = useMemo(() => {
    const r: { label: string; value: string }[] = [
      { label: t("startDateLabel"), value: formatDateWithTranslation(startDate, "DD MMM YYYY", tMonths) },
      { label: t("amount"), value: amountLabel },
    ];
    if (status === "Active" && nextBillingDate) {
      r.splice(1, 0, {
        label: t("nextBillingLabel"),
        value: formatDateWithTranslation(nextBillingDate, "DD MMM YYYY", tMonths),
      });
    }
    if (status === "Cancelled" && cancelDate) {
      r.splice(1, 0, {
        label: t("cancelDateLabel"),
        value: formatDateWithTranslation(cancelDate, "DD MMM YYYY", tMonths),
      });
    }
    if (status === "Paused" && pauseDate) {
      r.splice(1, 0, {
        label: t("pauseDateLabel"),
        value: formatDateWithTranslation(pauseDate, "DD MMM YYYY", tMonths),
      });
    }
    return r;
  }, [
    startDate,
    amountLabel,
    status,
    nextBillingDate,
    cancelDate,
    pauseDate,
    t,
    tMonths,
  ]);

  return (
    <DetailCard
      statusBadge={{
        label:
          status === "Active"
            ? t("subscriptionStatusActive")
            : status === "Cancelled"
              ? t("subscriptionStatusCancelled")
              : status === "Paused"
                ? t("subscriptionStatusPaused")
                : status,
        className: subscriptionStatusBadgeClass[status] ?? "bg-gray-500 text-white",
      }}
      title={planLabel}
      rows={rows}
      reason={reason ?? undefined}
    />
  );
}

export default memo(PlanHistoryCard);
