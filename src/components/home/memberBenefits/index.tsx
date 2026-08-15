import React, { memo } from "react";
import { benefitsData } from "@/components/constants";
import BenefitCard from "./BenefitCard";
import HeaderContent from "./HeaderContent";
import BenefitsSlider from "./BenefitsSlider";
import { MembershipSection } from "@/store/api/types/landing.types";
import { usePreviewUrl } from "@/hooks/usePreviewUrl";

// Main Component
const MemberBenefits = ({ data }: { data?: MembershipSection }) => {
  const imageUrl = usePreviewUrl(data?.backgroundImage);

  if (!data?.isEnabled) return null;

  const benefits = data?.benefits || [];

  return (
    // <section className="relative w-full  py-2.5 section-padding bg-none radius-style">
    <section className="relative w-full section-padding bg-none radius-style">
      {/* Background Image with Overlay */}
      <div
        className="relative radius-style bg-cover bg-center bg-no-repeat min-h-[300px] flex flex-col justify-center items-center pb-5 pt-6 overflow-hidden"
        style={{
          backgroundImage: `url(${imageUrl || "/memberBenefits.jpg"})`,
        }}
      >
        {/* Black overlay */}
        <div className="absolute inset-0 radius-style bg-black/30" />

        {/* Header Content */}
        <HeaderContent data={data} />

        {/* Benefits Cards - Mobile Slider */}
        <div className="relative z-10 w-full lg:hidden ">
          <BenefitsSlider data={benefits} />
        </div>

        {/* Benefits Cards - Desktop Grid */}
        {benefits?.length > 0 && (
          <div className="w-full max-w-6xl px-6">
            <div
              data-aos="fade-up"
              data-aos-delay="600"
              className="relative z-10 hidden lg:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8  bg-white/10 backdrop-blur-lg radius-style px-9 pt-3"
            >
              {benefits.map((benefit, index) => (
                <BenefitCard key={index} benefit={benefit} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(MemberBenefits);
