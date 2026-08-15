"use client";

import { useState } from "react";
import { MembershipPlan } from "@/store/api/types/membership.types";
import { getCurrencySymbol } from "@/lib/utils";
import SelectField from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getPlanIntervalLabel } from "./membershipUtils";

interface MembershipSignupFormProps {
  plans: MembershipPlan[];
  selectedPlanIndex: number;
  onSelectPlan: (index: number) => void;
  onContinue: () => void;
}

export default function MembershipSignupForm({
  plans,
  selectedPlanIndex,
  onSelectPlan,
  onContinue,
}: MembershipSignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <section className="py-12 lg:pb-[100px] lg:pt-0 flex flex-col items-center">
      <div className="w-full max-w-[700px] flex flex-col items-center gap-[30px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-saans text-2xl lg:text-[28px] font-medium text-black-color">
            Start your Membership Plan today
          </h2>
          <p className="max-w-[600px] font-saans text-sm lg:text-base text-black-color">
            It takes less than two minutes to set up. You can add members from
            your dashboard the moment you sign up.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 w-full items-center"
        >
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-[#EBEBEB] bg-white px-4 py-3 font-saans text-sm text-black-color placeholder:text-[#888888] outline-none focus:border-teal-green-color"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-[#EBEBEB] bg-white px-4 py-3 font-saans text-sm text-black-color placeholder:text-[#888888] outline-none focus:border-teal-green-color"
              />
            </div>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#EBEBEB] bg-white px-4 py-3 font-saans text-sm text-black-color placeholder:text-[#888888] outline-none focus:border-teal-green-color"
            />

            <SelectField
              value={plans.length > 0 ? String(selectedPlanIndex) : ""}
              onChange={(e) => onSelectPlan(Number(e.target.value))}
              placeholder="Choose a plan..."
            >
              {plans.map((plan, index) => {
                const symbol = getCurrencySymbol(plan.price.currency);
                const interval = getPlanIntervalLabel(plan);
                return (
                  <option key={plan.id} value={index}>
                    {plan.name} — {symbol}
                    {plan.price.amount.toFixed(
                      Number.isInteger(plan.price.amount) ? 0 : 2,
                    )}
                    /{interval}
                  </option>
                );
              })}
            </SelectField>

            <div className="flex w-full flex-col gap-4 pt-2">
              <Button
                type="submit"
                variant="elevate"
                size="elevate-md"
                animateText
                className="w-full bg-teal-green-color hover:bg-dark-teal-green-color h-12!"
              >
                Continue to billing
              </Button>
              <p className="text-center font-saans text-xs text-[#6E6E6E]">
                By joining, you confirm you&apos;ve read our terms. Members will
                receive an email notification when added — they can opt out at
                any time. Two shipping addresses maximum across the whole plan.
                No auto-enrol.
              </p>
            </div>
          </form>
      </div>
    </section>
  );
}
