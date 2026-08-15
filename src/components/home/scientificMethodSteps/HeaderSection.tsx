import { DesignedByScienceSection } from "@/store/api/types/landing.types";
import React from "react";
import { useTranslations } from "next-intl";

const HeaderSection = ({ data }: { data?: DesignedByScienceSection }) => {
  const t = useTranslations("Landing");
  return (
  <div className="text-center mb-8 md:mb-16 px-1">
    <h2
      data-aos="fade-up"
      className="heading-style mb-3 font-saans text-black-color text-balance [overflow-wrap:normal] [word-break:normal]"
    >
      {data?.title || t("designedByScience")}
    </h2>
    <p
      data-aos="fade-up"
      data-aos-delay="300"
      className="sub-heading-style mb-3 md:mb-6 font-saans text-black-color max-w-3xl mx-auto text-balance [overflow-wrap:normal] [word-break:normal]"
    >
      {data?.description ||
        t("scientificCommitteeDescription")}
    </p>
  </div>
);
};

export default HeaderSection;
