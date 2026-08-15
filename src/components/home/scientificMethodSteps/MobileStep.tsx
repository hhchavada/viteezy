import React from "react";
import { TeamCollaborationIcon } from "@/components/icons";
import { DesignedByScienceStep } from "@/store/api/types/landing.types";
import FallbackImage from "@/components/ui/fallbackImage";
import { usePreviewUrl } from "@/hooks/usePreviewUrl";
import { useTranslations } from "next-intl";

const MobileStep = ({
  step,
  index,
}: {
  step: DesignedByScienceStep;
  index: number;
}) => {
  const t = useTranslations("Landing");
  const imageUrl = usePreviewUrl(step?.image);

  return (
    <div data-aos="fade-up" className="flex flex-col items-center text-center">
      <div className="relative mx-auto mb-3 w-44">
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-orange-color px-5 py-1 font-saans text-base font-regular whitespace-nowrap text-white">
          {t("step")} {index + 1}
        </div>

        <div className="size-44 shrink-0 overflow-hidden rounded-full">
          <FallbackImage
            src={imageUrl || ""}
            height={176}
            width={176}
            alt={step?.title || ""}
            className="size-full object-cover"
          />
        </div>

        <div className="absolute -bottom-6 -right-6 -rotate-4">
          <TeamCollaborationIcon />
        </div>
      </div>

      <div className="w-full max-w-sm">
        <h3 className="my-1 text-xl font-saans font-medium text-black-color line-clamp-2 wrap-break-word">
          {step.title}
        </h3>
        <p className="text-black-color sub-heading-style font-saans mx-auto wrap-break-word line-clamp-3">
          {step.description}
        </p>
      </div>
    </div>
  );
};

export default MobileStep;
