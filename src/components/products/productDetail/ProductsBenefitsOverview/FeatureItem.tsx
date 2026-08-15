import { memo } from "react";
import Image from "next/image";

// Memoized feature item component to prevent unnecessary re-renders
const FeatureItem = memo(
  ({
    ProductsBenefit,
    className,
    variant = "default",
  }: {
    ProductsBenefit: {
      title: string;
      description: string;
      image: string;
    };
    className?: string;
    variant?: "default" | "card";
  }) => {
    if (variant === "card") {
      return (
        <article
          className={`flex h-[240px] w-[200px] shrink-0 flex-col items-center justify-start rounded-2xl border border-white/20 bg-white/5 p-4 text-center backdrop-blur-sm ${className || ""}`}
        >
          <Image
            width={72}
            height={72}
            className="mb-3 h-[72px] w-[72px] shrink-0 rounded-full object-cover"
            src={ProductsBenefit.image}
            alt={ProductsBenefit.title}
          />
          <h3 className="mb-1.5 line-clamp-2 font-saans text-sm font-semibold leading-snug text-white">
            {ProductsBenefit.title}
          </h3>
          <p className="line-clamp-3 text-xs font-light leading-relaxed text-white/80">
            {ProductsBenefit.description}
          </p>
        </article>
      );
    }

    return (
      <div className={`flex flex-col items-center gap-2.5 ${className || ""}`}>
        <div className="mb-3 md:mb-4">
          <Image
            width={100}
            height={100}
            className="shrink-0 w-36 h-36 md:w-24 md:h-24 rounded-full object-cover"
            src={ProductsBenefit.image}
            alt={ProductsBenefit.title}
          />
        </div>
        <h3 className="text-2xl md:text-xl font-medium font-saans text-white leading-tight line-clamp-1 3xl:text-[28px]">
          {ProductsBenefit.title}
        </h3>
        <span className="text-xl md:text-base text-center text-white leading-5 font-extralight px-4 md:px-0 line-clamp-2 3xl:text-[21px]">
          {ProductsBenefit.description}
        </span>
      </div>
    );
  },
);

FeatureItem.displayName = "FeatureItem";

export default FeatureItem;
