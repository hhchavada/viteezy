"use client";

import React, { memo, useState } from "react";
import AccountNav from "../components/AccountNav";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/components/types/account";
import PortalDialog from "@/components/ui/portalDialog";
import { useGetSubscriptionQuery } from "@/store/api/subscriptionApi";
import Plan from "./Plan";
import { useTranslations } from "next-intl";

// Static subscription data
const currentSubscription: SubscriptionPlan = {
  id: "1",
  planName: "3-Month Plan",
  duration: "3 months",
  price: 24.99,
  renewalDate: "12 Dec 2025",
  status: "active",
};

const Subscribe = () => {
  const t = useTranslations("Account");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { data: subsciptions } = useGetSubscriptionQuery();
  console.log(subsciptions);

  const handleCancelPlan = () => {
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    console.log("Subscription cancelled");
    setIsCancelDialogOpen(false);
  };

  const handleKeepPlan = () => {
    setIsCancelDialogOpen(false);
  };

  const handlePausePlan = () => {
    console.log("Pause plan clicked");
  };

  return (
    <div>
      <AccountNav title={t("subscriptions")} />

      {/* Subscription Card */}
      <div className="mt-7">
        {subsciptions?.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 4xl:grid-cols-4 gap-3">
            {subsciptions?.data?.map((item, index) => {
              return (
                <Plan
                  key={index}
                  data={item}
                  handlePausePlan={handlePausePlan}
                  handleCancelPlan={handleCancelPlan}
                />
              );
            })}
          </div>
        ) : (
          <span className="text-gray-500">
            {t("noActiveSubscriptions")}
          </span>
        )}
      </div>

      {/* Cancel Subscription Dialog */}
      <PortalDialog
        isShow={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        width={550}
        showCloseButton={false}
        bodyClass="p-8"
        contentClass="mt-0"
      >
        <div className="space-y-6">
          {/* Title */}
          <h2 className="text-2xl font-medium text-gray-900">
            {t("cancelSubscriptionTitle")}
          </h2>

          {/* Message */}
          <p className="text-gray-700 text-lg">
            {t("cancelSubscriptionKeepAccess", { date: "12 Feb 2026" })}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold bg-coral-red hover:bg-coral-red/90"
              onClick={handleConfirmCancel}
              animateText
            >
              {t("confirmCancelSubscription")}
            </Button>
            <Button
              variant="elevate"
              size="elevate-md"
              className="flex-1 font-semibold bg-gray-900 hover:bg-gray-800"
              onClick={handleKeepPlan}
              animateText
            >
              {t("keepPlan")}
            </Button>
          </div>
        </div>
      </PortalDialog>
    </div>
  );
};

export default memo(Subscribe);
