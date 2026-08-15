import React, { memo } from "react";
import HeaderSection from "./HeaderSection";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { DesignedByScienceSection } from "@/store/api/types/landing.types";

const ScientificMethodSteps = ({
  data,
}: {
  data?: DesignedByScienceSection;
}) => {
  if (!data?.isEnabled) return null;
  return (
    <section className="bg-pastel-yellow-color mx-2.5 radius-style section-py px-4">
      <div className="w-section mx-auto xl:px-14">
        {/* Header */}
        <HeaderSection data={data} />

        {/* Steps - Desktop Layout */}
        <DesktopLayout data={data} />

        {/* Steps - Mobile Layout */}
        <MobileLayout data={data} />
      </div>
    </section>
  );
};

export default memo(ScientificMethodSteps);
