import Image from "next/image";
import { MembershipPlan } from "@/store/api/types/membership.types";
import { HOW_IT_WORKS_STEPS } from "./constants";
import { formatPlansPickerText } from "./membershipUtils";

interface MembershipHowItWorksProps {
  plans: MembershipPlan[];
}

export default function MembershipHowItWorks({
  plans,
}: MembershipHowItWorksProps) {
  const subscribeDescription = plans.length
    ? `Pick ${formatPlansPickerText(plans)}. We'll email you a member-link page right after.`
    : HOW_IT_WORKS_STEPS[0].description;

  const steps = HOW_IT_WORKS_STEPS.map((step, index) =>
    index === 0 ? { ...step, description: subscribeDescription } : step,
  );

  return (
    <section className="flex flex-col items-center gap-8 py-10 lg:gap-[60px] lg:py-[100px]">
      <div className="flex flex-col items-center gap-2 text-center lg:gap-3">
        <h2 className="font-saans text-2xl font-medium text-charcol-color lg:text-[28px]">
          How it works
        </h2>
        <p className="max-w-2xl font-saans text-sm text-charcol-color lg:text-base">
          Simple process assesses health, uses AI, and delivers personalized
          care.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:gap-[60px] xl:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex flex-col-reverse items-center gap-4 text-center sm:flex-col sm:gap-8 lg:gap-[34px]"
          >
            <div
              className={`relative size-[120px] shrink-0 overflow-hidden sm:size-[170px] lg:size-[190px] ${step.imageClassName}`}
            >
              <Image
                src={step.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 120px, 190px"
              />
            </div>
            <div className="flex w-full flex-col gap-1.5 sm:gap-4">
              <h3 className="font-saans text-lg leading-snug font-medium text-[#1B1B1B] lg:text-xl">
                {step.title}
              </h3>
              <p className="font-saans text-sm leading-normal text-[#1B1B1B]/80 lg:text-base">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
