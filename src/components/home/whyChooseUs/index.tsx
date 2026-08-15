import { memo } from "react";
import HeaderSection from "./HeaderSection";
import FeaturesGrid from "./FeaturesGrid";
import { FeaturesSection } from "@/store/api/types/landing.types";

const WhyChooseUs = ({ data }: { data?: FeaturesSection }) => {
  if (!data?.isEnabled) return null;
  return (
    <section
      className="section-py px-4 bg-white"
      aria-labelledby="why-choose-us-heading"
    >
      <div className=" mx-auto w-section max-auto">
        <div className="flex flex-col xl:flex-row gap-8 md:gap-12 lg:gap-10 justify-between items-start lg:items-center ">
          {/* Left Section - Heading and Description */}
          <HeaderSection data={data} />

          {/* Right Section - 2x2 Grid of Features with Dividers */}
          <FeaturesGrid data={data} />
        </div>
      </div>
    </section>
  );
};

// Memoize the main component to prevent unnecessary re-renders
export default memo(WhyChooseUs);
