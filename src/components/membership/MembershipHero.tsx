"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { MembershipPlan } from "@/store/api/types/membership.types";
import { getCurrencySymbol, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  formatPerMonthLine,
  getPlanIntervalLabel,
  getHeroHighlights,
  isBestValuePlan,
  sortMembershipPlans,
} from "./membershipUtils";

interface MembershipHeroProps {
  plans: MembershipPlan[];
  onSelectPlan: (index: number) => void;
  onStartPlan: (planIndex?: number) => void;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/membership/check-icon.svg"
      alt=""
      width={18}
      height={18}
      className={className}
      aria-hidden
    />
  );
}

interface PlanCardProps {
  title: string;
  subtitle: string;
  price: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function PlanCard({
  title,
  subtitle,
  price,
  isExpanded,
  onToggle,
  badge,
  children,
}: PlanCardProps) {
  const headerContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-saans text-xl font-medium leading-tight text-black-color">
            {title}
          </h2>
          <p className="font-saans text-sm leading-snug text-[#6E6E6E]">
            {subtitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {!isExpanded ? (
            <ChevronDown className="mt-0.5 size-5 shrink-0 text-[#6E6E6E]" />
          ) : null}
        </div>
      </div>
      <div className="mt-3 font-saans text-[30px] font-medium leading-normal text-black">
        {price}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "rounded-[25px] transition-shadow duration-300",
        isExpanded
          ? "bg-gradient-to-br from-teal-green-color/50 via-teal-green-color to-teal-green-color/25 p-[2px] shadow-[0px_10px_64px_0px_rgba(27,175,154,0.12)]"
          : "border border-[#EBEBEB] bg-[#F5F5F5]",
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-[23px]",
          isExpanded ? "bg-white" : "bg-[#F5F5F5]",
        )}
      >
        {isExpanded ? (
          <div className="px-5 py-5 sm:px-6">{headerContent}</div>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="w-full cursor-pointer px-5 py-5 text-left transition-colors hover:bg-[#EFEFEF] sm:px-6"
            aria-expanded={false}
          >
            {headerContent}
          </button>
        )}

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-6 border-t border-[#F0F0F0] px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembershipHero({
  plans,
  onSelectPlan,
  onStartPlan,
}: MembershipHeroProps) {
  const sortedPlans = useMemo(() => sortMembershipPlans(plans), [plans]);
  const heroHighlights = useMemo(() => getHeroHighlights(plans), [plans]);

  const defaultExpandedId = useMemo(() => {
    const bestValue = sortedPlans.find(isBestValuePlan);
    return bestValue?.id ?? sortedPlans[0]?.id ?? null;
  }, [sortedPlans]);

  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (defaultExpandedId) {
      setExpandedPlanId(defaultExpandedId);
    }
  }, [defaultExpandedId]);

  const handleExpand = (plan: MembershipPlan) => {
    setExpandedPlanId(plan.id);
    const planIndex = plans.findIndex((item) => item.id === plan.id);
    if (planIndex >= 0) onSelectPlan(planIndex);
  };

  if (!sortedPlans.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-10 py-10 lg:flex-row lg:gap-[60px] lg:py-16">
      <div className="flex flex-1 flex-col gap-8 lg:gap-10">
        <span className="font-saans inline-flex w-fit items-center rounded-full bg-teal-green-color px-3 py-2 text-md font-medium text-white shadow-lg shadow-teal-green-color/20">
          Viteezy Membership
        </span>

        <div className="flex flex-col gap-4">
          <h1 className="font-saans text-[28px] leading-[1.1] font-medium tracking-[-0.02em] text-black-color sm:text-[32px] lg:text-[38px]">
            Wellness for the whole house hold.
          </h1>
          <p className="max-w-[690px] font-saans text-sm leading-normal text-black-color lg:text-base">
            Add up to 4 family members or close friends. Two shipping addresses.
            One simple price — and member discounts on everything, every order.
          </p>
        </div>

        {heroHighlights.length > 0 && (
          <div className="flex flex-col gap-5">
            {heroHighlights.map((text) => (
              <div key={text} className="flex items-center gap-2.5">
                <Image
                  src="/membership/hero-check.svg"
                  alt=""
                  width={18}
                  height={18}
                  aria-hidden
                />
                <span className="font-saans text-sm text-black-color lg:text-base">
                  {text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[600px]">
        {sortedPlans.map((plan) => {
          const planIndex = plans.findIndex((item) => item.id === plan.id);
          const isExpanded = expandedPlanId === plan.id;
          const perMonthLine = formatPerMonthLine(plan);
          const symbol = getCurrencySymbol(plan.price.currency);
          const priceSuffix = getPlanIntervalLabel(plan);

          return (
            <PlanCard
              key={plan.id}
              title={plan.name}
              subtitle={plan.shortDescription}
              price={
                <span className="inline-flex items-baseline">
                  {symbol}
                  {plan.price.amount.toFixed(
                    Number.isInteger(plan.price.amount) ? 0 : 2,
                  )}
                  <span className="text-base">/{priceSuffix}</span>
                </span>
              }
              isExpanded={isExpanded}
              onToggle={() => handleExpand(plan)}
              badge={
                isBestValuePlan(plan) ? (
                  <span className="font-saans inline-flex shrink-0 items-center rounded-full bg-pastel-yellow-color px-2.5 py-1 text-xs font-medium text-[#104F54]">
                    Best Value
                  </span>
                ) : undefined
              }
            >
              <div className="flex flex-col gap-4">
                <p className="font-saans text-base font-medium text-black-color">
                  What&apos;s included:
                </p>
                <div className="flex flex-col gap-3">
                  {plan.benefits.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckIcon />
                      <span className="font-saans text-sm text-black-color/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="elevate"
                  size="elevate-md"
                  animateText
                  className="h-12! w-full bg-teal-green-color hover:bg-dark-teal-green-color"
                  onClick={() => {
                    if (planIndex >= 0) onSelectPlan(planIndex);
                    onStartPlan(planIndex >= 0 ? planIndex : 0);
                  }}
                >
                  Choose {plan.name}
                </Button>
                {perMonthLine && (
                  <p className="text-center font-saans text-sm text-[#989898]">
                    {perMonthLine}
                  </p>
                )}
              </div>
            </PlanCard>
          );
        })}
      </div>
    </div>
  );
}
