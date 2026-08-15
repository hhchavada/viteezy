"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useGetPostponementsBySubscriptionQuery } from "@/store/api/subscriptionApi";
import { Postponement } from "@/store/api/types/postponement.types";
import { Subscription } from "@/store/api/types/subsciption.types";
import { formatDateWithTranslation } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DetailCard from "./DetailCard";
import AddPostponementModal from "./AddPostponementModal";
import { subscriptionStatus } from "@/components/constants/subscription";
import { useTranslations } from "next-intl";

const POSTPONEMENT_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
} as const;

const STATUS_STYLES: Record<string, string> = {
  [POSTPONEMENT_STATUS.APPROVED]: "bg-light-mint text-aqua-deep",
  [POSTPONEMENT_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [POSTPONEMENT_STATUS.REJECTED]: "bg-pastel-pink text-paprika",
  [POSTPONEMENT_STATUS.CANCELLED]: "bg-gray-200 text-gray-700",
};

interface DeliveryPostponementTabProps {
  subscriptionId: string;
  isTabActive: boolean;
  subscription?: Subscription | null;
}

/** Request ID display: use order number or short _id */
function getRequestId(item: Postponement): string {
  const orderNum = item.orderId?.orderNumber;
  if (orderNum) return orderNum;
  return item._id?.slice(-8)?.toUpperCase() || item._id || "—";
}

export default function DeliveryPostponementTab({
  subscriptionId,
  isTabActive,
  subscription,
}: DeliveryPostponementTabProps) {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, error, refetch } =
    useGetPostponementsBySubscriptionQuery(subscriptionId, {
      skip: !isTabActive || !subscriptionId,
    });

  const postponements = data?.data ?? [];

  const isCancelled = subscription?.status === subscriptionStatus.cancelled;
  const isPaused =
    subscription?.status?.toLowerCase() === "paused" ||
    subscription?.status === "Paused";
  const canAddPostponement = !isCancelled && !isPaused;
  const showAddButton = !isCancelled;

  const handleAddPostponement = useCallback(() => {
    if (isCancelled || isPaused) return;
    setIsAddModalOpen(true);
  }, [isCancelled, isPaused]);
  const handleCloseAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const handleAddSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!isTabActive) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-gray-500 rounded-lg bg-slate-50 border border-slate-200">
        {t("failedLoadDeliveryPostponements")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {postponements.length === 0 ? (
        <div className="py-2 px-1">
          <h3 className="text-2xl 3xl:text-4xl font-medium text-gray-900 mb-3 3xl:mb-7">
            {t("noPostponementRequestsFound")}
          </h3>
          <p className="text-base 3xl:text-lg text-gray-500 mb-6 max-w-lg 3xl:mb-7.5">
            {t("noPostponementRequestsDescription")}
          </p>
          {showAddButton && (
            <Button
              type="button"
              variant="elevate"
              size="elevate-md"
              onClick={handleAddPostponement}
              animateText
              className="px-4"
              disabled={!canAddPostponement}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-6 h-6" />
                {t("addPostponement")}
              </span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("deliveryPostponement")}
            </h2>
            {showAddButton && (
              <button
                type="button"
                onClick={handleAddPostponement}
                disabled={!canAddPostponement}
                className="inline-flex items-center font-medium px-4 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-teal-500 hover:bg-gray-50 hover:text-teal-700 disabled:hover:bg-transparent disabled:hover:text-teal-500"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {t("addPostponement")}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {postponements.map((item) => (
              <DeliveryPostponementCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}

      <AddPostponementModal
        isOpen={isAddModalOpen && canAddPostponement}
        onClose={handleCloseAddModal}
        orderId={subscription?.orderId?._id ?? ""}
        currentDeliveryDate={subscription?.nextDeliveryDate ?? ""}
        subscriptionId={subscriptionId}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}

function DeliveryPostponementCard({ item }: { item: Postponement }) {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const isApproved = item.status === POSTPONEMENT_STATUS.APPROVED;

  const rows = useMemo(() => {
    const newDeliveryDate =
      item.approvedDeliveryDate ?? item.requestedDeliveryDate;
    const r: { label: string; value: string }[] = [
      {
        label: t("oldDeliveryDate"),
        value: formatDateWithTranslation(item.originalDeliveryDate, "DD MMM YYYY", tMonths),
      },
      {
        label: t("newDeliveryDate"),
        value: formatDateWithTranslation(newDeliveryDate, "DD MMM YYYY", tMonths),
      },
    ];
    if (isApproved && item.updatedAt) {
      r.push({ label: t("approveDate"), value: formatDateWithTranslation(item.updatedAt, "DD MMM YYYY", tMonths) });
    }
    return r;
  }, [
    item.originalDeliveryDate,
    item.requestedDeliveryDate,
    item.approvedDeliveryDate,
    item.updatedAt,
    isApproved,
    t,
    tMonths,
  ]);

  return (
    <DetailCard
      statusBadge={{
        label:
          item.status === POSTPONEMENT_STATUS.APPROVED
            ? t("statusApproved")
            : item.status === POSTPONEMENT_STATUS.PENDING
              ? t("orderStatusPending")
              : item.status === POSTPONEMENT_STATUS.REJECTED
                ? t("statusRejected")
                : item.status === POSTPONEMENT_STATUS.CANCELLED
                  ? t("statusCancelled")
                  : item.status,
        className: STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-800",
      }}
      title={`${t("requestLabel")} #${getRequestId(item)}`}
      rows={rows}
      reason={item.reason ?? undefined}
      dimmed={!isApproved}
    />
  );
}
