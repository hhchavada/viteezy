"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useGetMembershipPlansQuery } from "@/store/api/membershipApi";
import Spinner from "../ui/spinner";
import { hasAuthToken } from "@/lib/utils";
import MembershipPaymentDialog from "./MembershipPaymentDialog";
import MembershipHero from "./MembershipHero";
import MembershipReasons from "./MembershipReasons";
import MembershipHowItWorks from "./MembershipHowItWorks";
import MembershipSavingsCalculator from "./MembershipSavingsCalculator";
import MembershipFaq from "./MembershipFaq";
import MembershipSignupForm from "./MembershipSignupForm";
import { findBestValuePlanIndex } from "./membershipUtils";

const HERO_REASONS_GRADIENT =
  "linear-gradient(to top, #FAF9F6 0%, #FAF9F6 35%, rgba(250, 249, 246, 0.85) 65%, #FFFFFF 100%)";

const MID_GRADIENT =
  "linear-gradient(180deg, #FAF9F6 0%, #FAF9F6 35%, rgba(250, 249, 246, 0.85) 65%, #FFFFFF 100%)";

const SIGNUP_GRADIENT =
  "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FAF9F6 12%, #FAF9F6 100%)";

export default function MembershipPage() {
  const { data: plansData, isLoading } = useGetMembershipPlansQuery();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const tCommon = useTranslations("Common");

  const plans = plansData?.data?.plans ?? [];
  const selectedPlan = plans[selectedPlanIndex];

  useEffect(() => {
    const apiPlans = plansData?.data?.plans;
    if (apiPlans?.length) {
      setSelectedPlanIndex(findBestValuePlanIndex(apiPlans));
    }
  }, [plansData]);

  const handleStartPlan = (planIndex?: number) => {
    if (planIndex !== undefined) {
      setSelectedPlanIndex(planIndex);
    }

    const plan = plans[planIndex ?? selectedPlanIndex];
    if (!plan) {
      toast.error(tCommon("selectPlanRequired"));
      return;
    }

    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }

    setIsPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-linear-to-b from-[#F7F6F0] to-[#FAF9F600] section-padding flex items-center justify-center">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white section-pb pb-0">
      {/* Sections 1 & 2 — hero + reasons, same gradient style as bottom (bottom → top) */}
      <div
        className="w-screen relative left-1/2 -translate-x-1/2 section-padding"
        style={{ background: HERO_REASONS_GRADIENT }}
      >
        <div className="relative max-w-6xl 3xl:max-w-7xl w-full mx-auto">
          <MembershipHero
            plans={plans}
            onSelectPlan={setSelectedPlanIndex}
            onStartPlan={handleStartPlan}
          />
          <MembershipReasons />
        </div>
      </div>

      {/* Section 3 — how it works */}
      <div className="section-padding">
        <div className="max-w-6xl 3xl:max-w-7xl w-full mx-auto">
          <MembershipHowItWorks plans={plans} />
        </div>
      </div>

      {/* Sections 4 & 5 — savings calculator through FAQ with full gradient */}
      <div
        className="w-screen relative left-1/2 -translate-x-1/2 section-padding"
        style={{ background: MID_GRADIENT }}
      >
        <div className="max-w-6xl 3xl:max-w-7xl w-full mx-auto">
          <MembershipSavingsCalculator
            plans={plans}
            onStartPlan={handleStartPlan}
          />
          <MembershipFaq />
        </div>
      </div>

      {/* Section 6 — signup with beige gradient */}
      <div
        className="w-screen relative left-1/2 -translate-x-1/2 section-padding"
        style={{ background: SIGNUP_GRADIENT }}
      >
        <div className="max-w-6xl 3xl:max-w-7xl w-full mx-auto">
          <MembershipSignupForm
            plans={plans}
            selectedPlanIndex={selectedPlanIndex}
            onSelectPlan={setSelectedPlanIndex}
            onContinue={() => handleStartPlan(selectedPlanIndex)}
          />
        </div>
      </div>

      <MembershipPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        planId={selectedPlan?.id ?? null}
      />
    </section>
  );
}
