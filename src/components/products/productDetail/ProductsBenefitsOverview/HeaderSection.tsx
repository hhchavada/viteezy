import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { resolveLocalizedValue } from "@/lib/utils";

interface HeaderSectionProps {
  productData?: any;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ productData }) => {
  const locale = useLocale();

  return (
    <div className="space-y-3 flex-1 lg:flex-[0.4] lg:max-w-2xl text-center lg:text-start w-full">
      <h2
        data-aos="fade-right"
        data-aos-delay="300"
        id="why-choose-us-heading"
        className="heading-style text-white pt-4 md:pt-10 3xl:text-[42px]"
      >
        {resolveLocalizedValue(productData?.specification?.main_title, locale) ||
          "Composed of the most nutritious algae"}
      </h2>
    </div>
  );
};

export default HeaderSection;
