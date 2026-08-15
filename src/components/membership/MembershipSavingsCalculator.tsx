"use client";

import { useEffect, useMemo, useState } from "react";
import { MembershipPlan } from "@/store/api/types/membership.types";
import { getCurrencySymbol } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SelectField from "@/components/ui/select";
import {
  findBestValuePlanIndex,
  getDiscountRateFromPlan,
  sortMembershipPlans,
} from "./membershipUtils";

interface MembershipSavingsCalculatorProps {
  plans: MembershipPlan[];
  onStartPlan: (planIndex: number) => void;
}

const SPEND_OPTIONS = [30, 50, 75, 100, 150, 200];
const MEMBER_OPTIONS = [1, 2, 3, 4, 5];

export default function MembershipSavingsCalculator({
  plans,
  onStartPlan,
}: MembershipSavingsCalculatorProps) {
  const sortedPlans = useMemo(() => sortMembershipPlans(plans), [plans]);
  const defaultPlanIndex = findBestValuePlanIndex(plans);

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(defaultPlanIndex);
  const [monthlySpend, setMonthlySpend] = useState(50);
  const [members, setMembers] = useState(2);

  useEffect(() => {
    setSelectedPlanIndex(findBestValuePlanIndex(plans));
  }, [plans]);

  const selectedPlan = plans[selectedPlanIndex] ?? plans[0];

  const savings = useMemo(() => {
    if (!selectedPlan) {
      return { gross: 0, net: 0, paybackMonth: 0, currency: "EUR" };
    }

    const yearlySpend = monthlySpend * 12 * members;
    const discountRate = getDiscountRateFromPlan(selectedPlan);
    const grossSavings = Math.round(yearlySpend * discountRate);
    const planCost = selectedPlan.price.amount;
    const netSavings = Math.max(0, grossSavings - planCost);
    const monthlySavings = grossSavings / 12;
    const paybackMonth =
      monthlySavings > 0 ? Math.ceil(planCost / monthlySavings) : 0;

    return {
      gross: grossSavings,
      net: netSavings,
      paybackMonth,
      currency: selectedPlan.price.currency,
    };
  }, [selectedPlan, monthlySpend, members]);

  const symbol = getCurrencySymbol(savings.currency);
  const spendSymbol = getCurrencySymbol(selectedPlan?.price.currency ?? "EUR");

  if (!plans.length) {
    return null;
  }

  return (
    <section className="py-12 lg:py-[100px]">
      <div className="flex w-full flex-col gap-8 rounded-[30px] bg-white p-6 sm:p-8 lg:grid lg:grid-cols-2 lg:gap-10 lg:p-10 xl:gap-[60px] xl:p-[60px]">
        <div className="flex w-full min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-2.5">
            <h2 className="font-saans text-2xl font-medium text-black-color lg:text-[28px]">
              Will the plan pay for itself?
            </h2>
            <p className="w-full font-saans text-sm leading-relaxed text-black-color lg:text-base">
              Plug in your typical monthly spend below and see your expected
              annual savings.
            </p>
          </div>

          <div className="flex w-full flex-col gap-5">
            <SelectField
              value={String(selectedPlanIndex)}
              onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
              placeholder="My plan type"
            >
              {sortedPlans.map((plan) => {
                const index = plans.findIndex((item) => item.id === plan.id);
                return (
                  <option key={plan.id} value={index}>
                    {plan.name}
                  </option>
                );
              })}
            </SelectField>

            <SelectField
              value={String(monthlySpend)}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              placeholder={`Average monthly spend (${spendSymbol})`}
            >
              {SPEND_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {spendSymbol}
                  {value}
                </option>
              ))}
            </SelectField>

            <SelectField
              value={String(members)}
              onChange={(e) => setMembers(Number(e.target.value))}
              placeholder="Members on plan (incl you)"
            >
              {MEMBER_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col items-center justify-center gap-6 rounded-[25px] bg-[#F4F8F7] px-6 py-8 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <p className="font-saans text-sm text-[#6E6E6E]">
              Your estimated yearly savings
            </p>
            <p className="font-saans text-[28px] leading-tight font-medium text-black lg:text-[30px]">
              {symbol}
              {savings.gross}
            </p>
            <p className="font-saans text-sm leading-snug text-[#6E6E6E]">
              before the {symbol}
              {selectedPlan?.price.amount.toFixed(
                Number.isInteger(selectedPlan?.price.amount) ? 0 : 2,
              )}{" "}
              plan cost — net {symbol}
              {savings.net}/year
            </p>
          </div>

          {savings.paybackMonth > 0 && (
            <Button
              type="button"
              variant="elevate"
              size="elevate-md"
              animateText
              className="h-11! w-full bg-teal-green-color hover:bg-dark-teal-green-color lg:h-12!"
              onClick={() => onStartPlan(selectedPlanIndex)}
            >
              Plan pays back by month {savings.paybackMonth}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
