import { usePreviewUrl } from "@/hooks/usePreviewUrl";
import FallbackImage from "@/components/ui/fallbackImage";
import Image from "next/image";
import type { MembershipBenefit } from "@/store/api/types/landing.types";

interface BenefitCardProps {
  benefit: MembershipBenefit;
  layout?: "row" | "column";
}

const BenefitCard = ({ benefit, layout = "column" }: BenefitCardProps) => {
  // Always get a previewable URL for the icon (File or string)
  const iconUrl = usePreviewUrl(benefit.icon);

  const IconComponent =
    benefit.icon && benefit.type === "icon" ? benefit.icon : null;

  if (layout === "row") {
    return (
      <div className="radius-style text-start transition-all duration-300 p-2">
        <div className="flex gap-5 items-start">
          <div className="col-span-1 flex justify-start">
            <div className="w-12.5 h-12.5 flex items-center justify-center">
              {IconComponent ? (
                <IconComponent className="text-white" />
              ) : iconUrl ? (
                <FallbackImage
                  className="w-full h-full object-cover"
                  width={70}
                  height={70}
                  src={iconUrl}
                  alt={benefit.title}
                />
              ) : null}
            </div>
          </div>
          <div className="col-span-4">
            <h3 className="text-base font-saans font-semibold text-white">
              {benefit.title}
            </h3>
            <p className="text-white font-saans font-light! text-[15px] line-clamp-1">
              {benefit.description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="radius-style py-5 text-start transition-all duration-300">
      <div className="flex justify-start mb-6">
        <div className="w-17.5 h-17.5 flex items-center justify-center hover:border-white/60 transition-colors duration-300">
          {IconComponent ? (
            <IconComponent className="w-8 h-8 text-white" />
          ) : iconUrl ? (
            <FallbackImage
              className="w-full h-full object-cover"
              width={70}
              height={70}
              src={iconUrl}
              alt={benefit.title}
            />
          ) : null}
        </div>
      </div>
      <h3 className="text-base font-saans font-semibold text-white">
        {benefit.title}
      </h3>
      <p className="text-white font-saans font-light! text-[15px] line-clamp-1">
        {benefit.description}
      </p>
    </div>
  );
};

export default BenefitCard;
