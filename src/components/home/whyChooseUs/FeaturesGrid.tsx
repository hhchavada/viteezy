import React from "react";
import { features } from "@/components/constants";
import FeatureItem from "./FeatureItem";
import Divider from "./Divider";
import { FeaturesSection } from "@/store/api/types/landing.types";

const FeaturesGrid = ({ data }: { data?: FeaturesSection }) => {
  if (!data?.isEnabled || !data?.features?.length) {
    return null;
  }

  const features = data.features
    ?.slice()
    ?.sort((a, b) => a?.order - b?.order);

  const leftColumn = features.filter((_, index) => index % 2 === 0);
  const rightColumn = features.filter((_, index) => index % 2 === 1);

  return (
    <div className="relative flex-1 lg:flex-[0.6] w-full">
      {/* Continuous Vertical Divider - spans entire height on desktop */}
      <Divider
        orientation="vertical"
        className="hidden lg:block absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-10"
      />

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 pt-1 md:pt-10 lg:pt-16 lg:pb-16">
        {/* Left Column - Features 0,2 */}
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="space-y-6 md:space-y-8 lg:space-y-10 pt-6 lg:pt-10"
        >
          {leftColumn?.map((feature, idx) => {
            return (
              <div key={"left" + idx}>
                <FeatureItem feature={feature} />
                {leftColumn?.length - 1 > idx && (
                  <Divider className="my-7.5 lg:my-14" />
                )}
              </div>
            );
          })}
          {/* <FeatureItem feature={features[0]} />
          <Divider className=" md:my-6 lg:my-8" />
          <FeatureItem feature={features[2]} /> */}
        </div>
        <Divider className="md:hidden" />

        {/* Right Column - Features 1,3 */}
        <div
          data-aos="fade-up"
          data-aos-delay="800"
          className="space-y-6 md:space-y-8 lg:space-y-10"
        >
          {rightColumn?.map((feature, idx) => {
            return (
              <div key={"right" + idx}>
                <FeatureItem feature={feature} />
                {rightColumn?.length - 1 > idx && (
                  <Divider className="my-7.5 lg:my-14" />
                )}
              </div>
            );
          })}
          {/* <FeatureItem feature={features[1]} />
          <Divider className=" md:my-6 lg:my-8" />
          <FeatureItem feature={features[3]} /> */}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;
