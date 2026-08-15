"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetSubscriptionByIdQuery,
  usePauseSubscriptionMutation,
  useCancelSubscriptionMutation,
} from "@/store/api/subscriptionApi";
import { Button } from "@/components/ui/button";
import { subscriptionStatus } from "@/components/constants/subscription";
import PortalDialog from "@/components/ui/portalDialog";
import { formatDateWithTranslation } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import PlanHistoryTab from "./planHistory";
import TransactionHistoryTab from "./TransactionHistoryTab";
import DeliveryPostponementTab from "./DeliveryPostponementTab";
import ShippingAddressTab from "./ShippingAddressTab";
import ProductHistoryTab from "./ProductHistoryTab";
import { useTranslations } from "next-intl";

const SUBSCRIPTION_DETAIL_TABS = [
  { id: "plan-history", labelKey: "planHistory" },
  { id: "transaction-history", labelKey: "transactionHistory" },
  { id: "delivery-postponement", labelKey: "deliveryPostponement" },
  { id: "product-history", labelKey: "productHistory" },
  { id: "shipping-address", labelKey: "shippingAddressTitle" },
] as const;

type SubscriptionDetailTabId = (typeof SUBSCRIPTION_DETAIL_TABS)[number]["id"];

function isSubscriptionDetailTabId(
  value: string | null
): value is SubscriptionDetailTabId {
  return SUBSCRIPTION_DETAIL_TABS.some((tab) => tab.id === value);
}

interface SubscriptionDetailPageProps {
  subscriptionId: string;
}

export default function SubscriptionDetailPage({
  subscriptionId,
}: SubscriptionDetailPageProps) {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab");
    return isSubscriptionDetailTabId(tabFromUrl) ? tabFromUrl : "plan-history";
  }, [searchParams]);
  const [activeTab, setActiveTab] =
    useState<SubscriptionDetailTabId>(initialTab);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);

  const { data, isLoading, isError } = useGetSubscriptionByIdQuery(
    subscriptionId,
    { skip: !subscriptionId },
  );

  const [pauseSubscription, { isLoading: isPausing }] =
    usePauseSubscriptionMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();

  const subscription = data?.data?.subscription;

  const handleCancelPlan = () => setIsCancelDialogOpen(true);
  const handleConfirmCancel = async () => {
    if (!subscriptionId) return;
    try {
      await cancelSubscription(subscriptionId).unwrap();
      toast.success(t("subscriptionCancelledSuccess"));
      setIsCancelDialogOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      toast.error(
        e?.data?.message || e?.message || t("subscriptionCancelFailed"),
      );
    }
  };
  const handleKeepPlan = () => setIsCancelDialogOpen(false);

  const handlePausePlan = () => setIsPauseDialogOpen(true);
  const handleConfirmPause = async () => {
    if (!subscriptionId) return;
    try {
      await pauseSubscription(subscriptionId).unwrap();
      toast.success(t("subscriptionPausedSuccess"));
      setIsPauseDialogOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      toast.error(
        e?.data?.message || e?.message || t("subscriptionPauseFailed"),
      );
    }
  };
  const handleKeepPause = () => setIsPauseDialogOpen(false);

  const handleRestartPlan = () => {
    // TODO: wire restart API when available
  };

  const isActive = subscription?.status === subscriptionStatus.active;
  const isCancelled = subscription?.status === subscriptionStatus.cancelled;
  const noManagableDays = -1;
  const isNoManagablePlan =
    subscription?.cycleDays === noManagableDays && !isCancelled;
  const showManageButtons = isActive && !isNoManagablePlan;
  const showRestartButton = isCancelled;

  if (isLoading) {
    return (
      <div className="w-section py-5 4xl:py-16 flex justify-center items-center min-h-[280px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (isError || !subscription) {
    return (
      <div className="w-section py-5 4xl:py-16">
        <p className="text-gray-500 mb-4">{t("subscriptionNotFound")}</p>
        <Button
          variant="elevate"
          size="elevate-md"
          className="font-semibold"
          onClick={() => router.push("/settings?tab=subscribe")}
          animateText
        >
          {t("backToSubscriptions")}
        </Button>
      </div>
    );
  }

  const planTitle =
    subscription.cycleDays === 1
      ? t("subscriptionOneDayPlan", { days: 1 })
      : subscription.cycleDays > 1
        ? t("subscriptionManyDaysPlan", { days: subscription.cycleDays })
        : subscription.planType || t("subscriptionPlan");

  return (
    <div className="w-section py-7 3xl:py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 text-sm 3xl:text-lg text-gray-900 flex items-center gap-1">
        <Link
          href="/settings?tab=subscribe"
          className="hover:text-teal-600 transition-colors"
        >
          {t("subscriptions")}
        </Link>
        <ChevronRight />
        <span className="text-gray-500">{planTitle}</span>
      </nav>

      {/* Title + Action buttons row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <h1 className="text-2xl lg:text-4xl font-medium text-gray-900">
          {planTitle}
        </h1>
        <div className="flex gap-2.5 shrink-0">
          {showManageButtons && (
            <>
              <Button
                variant="elevate"
                size="elevate-md"
                className="font-semibold bg-coral-red hover:bg-coral-red/90"
                onClick={handleCancelPlan}
                animateText
              >
                {t("cancelPlan")}
              </Button>
              <Button
                variant="elevate"
                size="elevate-md"
                className="font-semibold bg-gray-900 hover:bg-gray-800"
                onClick={handlePausePlan}
                animateText
              >
                {t("pausePlan")}
              </Button>
            </>
          )}
          {/* Restart button commented out for now
          {showRestartButton && (
            <Button
              variant="elevate"
              size="elevate-md"
              className="font-semibold"
              onClick={handleRestartPlan}
              animateText
            >
              Restart Plan
            </Button>
          )}
          */}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5.25 3xl:mt-6 mb-6.75 3xl:mb-7.75">
        <div className="flex flex-wrap items-center gap-2">
          {SUBSCRIPTION_DETAIL_TABS.map((tab) => {
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SubscriptionDetailTabId)}
                className={`
                  shrink-0 px-3 4xl:px-5 py-1.5 3xl:py-1.75 rounded-full text-sm 3xl:text-lg font-medium transition-colors border cursor-pointer
                  ${
                    isActiveTab
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-slate-50 border-transparent text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                  }
                `}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
        {/* <hr className="w-full mt-3 border-0 h-px bg-slate-border-color" /> */}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "plan-history" && (
          <PlanHistoryTab subscription={subscription} />
        )}
        {activeTab === "transaction-history" && (
          <TransactionHistoryTab
            subscriptionId={subscriptionId}
            isTabActive={activeTab === "transaction-history"}
          />
        )}
        {activeTab === "delivery-postponement" && (
          <DeliveryPostponementTab
            subscriptionId={subscriptionId}
            isTabActive={activeTab === "delivery-postponement"}
            subscription={subscription}
          />
        )}
        {activeTab === "shipping-address" && (
          <ShippingAddressTab
            subscriptionId={subscriptionId}
            isTabActive={activeTab === "shipping-address"}
          />
        )}
        {activeTab === "product-history" && (
          <ProductHistoryTab 
            subscriptionId={subscriptionId} 
            subscriptionStatus={subscription?.status}
            subscriptionRelation={subscription?.subscriptionRelation}
            cycleDays={subscription?.cycleDays}
          />
        )}
      </div>

      {/* Cancel dialog */}
      <PortalDialog
        isShow={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        width={550}
        showCloseButton={false}
        bodyClass="p-8"
        contentClass="mt-0"
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-gray-900">
            {t("cancelSubscriptionTitle")}
          </h2>
          <p className="text-gray-700 text-lg">
            {t("cancelSubscriptionKeepAccess", {
              date: subscription.subscriptionEndDate
                ? formatDateWithTranslation(subscription.subscriptionEndDate, "DD MMM YYYY", tMonths)
                : t("endOfBillingPeriod"),
            })}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold bg-coral-red hover:bg-coral-red/90"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              animateText
            >
            {isCancelling ? t("cancelling") : t("confirmCancelSubscription")}
            </Button>
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold"
              onClick={handleKeepPlan}
              disabled={isCancelling}
              animateText
            >
              {t("keepPlan")}
            </Button>
          </div>
        </div>
      </PortalDialog>

      {/* Pause dialog */}
      <PortalDialog
        isShow={isPauseDialogOpen}
        onClose={() => !isPausing && setIsPauseDialogOpen(false)}
        width={550}
        showCloseButton={false}
        bodyClass="p-8"
        contentClass="mt-0"
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-medium text-gray-900">
            {t("pauseSubscriptionTitle")}
          </h2>
          <p className="text-gray-700 text-lg">
            {t("pauseSubscriptionDescription")}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold bg-coral-red hover:bg-coral-red/90"
              onClick={handleConfirmPause}
              disabled={isPausing}
              animateText
            >
              {isPausing ? t("pausing") : t("confirmPause")}
            </Button>
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold"
              onClick={handleKeepPause}
              disabled={isPausing}
              animateText
            >
              {t("keepPlan")}
            </Button>
          </div>
        </div>
      </PortalDialog>
    </div>
  );
}
