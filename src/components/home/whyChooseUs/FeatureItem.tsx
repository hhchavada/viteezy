import { memo } from "react";
import type { FeatureItem } from "@/store/api/types/landing.types";
import FallbackImage from "@/components/ui/fallbackImage";
import { usePreviewUrl } from "@/hooks/usePreviewUrl";
import { useTranslations } from "next-intl";

const FeatureItem = memo(
  ({ feature, className }: { feature: FeatureItem; className?: string }) => {
    const t = useTranslations("Landing");
    const iconUrl = usePreviewUrl(feature?.icon);

    return (
      <div className={`space-y-4 ${className || ""}`}>
        <div className="flex items-start gap-8 lg:gap-10">
          <FallbackImage
            height={80}
            width={80}
            src={iconUrl || ""}
            alt={feature?.title || t("featureIcon")}
            className="shrink-0 mt-1 w-16 xl:w-19.5 h-16 xl:h-19.5"
          />
          <div className="space-y-4 3xl:space-y-5">
            <h3 className="text-xl 3xl:text-[28px] font-semibold font-saans text-black-color leading-tight">
              {feature?.title}
            </h3>
            <p className="text-base 3xl:text-xl font-saans text-black-color font-normal leading-tight">
              {feature?.description}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

FeatureItem.displayName = "FeatureItem";

export default FeatureItem;
