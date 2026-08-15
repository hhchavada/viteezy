import React from "react";
import { TeamCollaborationIcon } from "@/components/icons";
import { DesignedByScienceStep } from "@/store/api/types/landing.types";
import FallbackImage from "@/components/ui/fallbackImage";
import { usePreviewUrl } from "@/hooks/usePreviewUrl";
import { useTranslations } from "next-intl";

const DesktopStep = ({
  step,
  showArrow,
  index,
}: {
  step: DesignedByScienceStep;
  showArrow?: boolean;
  index: number;
}) => {
  const t = useTranslations("Landing");
  const imageUrl = usePreviewUrl(step?.image);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-8 3xl:mb-11 w-44 3xl:w-52 h-44 3xl:h-52">
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 bg-soft-orange-color text-white px-4 py-0.25 rounded-full font-saans text-lg font-regular z-10 text-nowrap">
          {t("step")} {index + 1}
        </div>

        <div className="w-full h-full rounded-full overflow-hidden">
          <FallbackImage
            src={imageUrl || ""}
            height={300}
            width={300}
            alt={step?.title || ""}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="absolute -bottom-10 -right-8 transform -rotate-4">
          <TeamCollaborationIcon />
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-2xl font-saans font-medium text-black-color my-2 truncate break-all">
          {step.title}
        </h3>
        <p className="text-black-color sub-heading-style font-saans mx-auto line-clamp-2">
          {step.description}
        </p>
      </div>
    </div>
  );
};

export default DesktopStep;
