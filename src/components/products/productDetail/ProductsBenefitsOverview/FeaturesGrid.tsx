"use client";

import React, { useMemo, useRef, useState } from "react";
import { ProductsBenefits } from "@/components/constants";
import FeatureItem from "./FeatureItem";
import Divider from "./Divider";
import { useLocale } from "next-intl";
import { resolveLocalizedValue } from "@/lib/utils";

interface FeaturesGridProps {
  productData?: any;
}

type ProductBenefit = {
  title: string;
  description: string;
  image: string;
  imageMobile?: string;
};

const MOBILE_CARD_WIDTH = 200;
const MOBILE_CARD_GAP = 12;

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ productData }) => {
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const benefits = useMemo<ProductBenefit[]>(() => {
    if (
      productData?.specification?.items &&
      productData.specification.items.length > 0
    ) {
      return productData.specification.items.map((item: any) => ({
        title: resolveLocalizedValue(item.title, locale),
        description: resolveLocalizedValue(item.descr, locale),
        image: item.image,
        imageMobile: item.imageMobile,
      }));
    }
    return ProductsBenefits as ProductBenefit[];
  }, [productData, locale]);

  const mobileBenefits = benefits.slice(0, 4);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) {
      setActiveIndex(0);
      return;
    }

    if (el.scrollLeft >= maxScrollLeft - 8) {
      setActiveIndex(mobileBenefits.length - 1);
      return;
    }

    const step = MOBILE_CARD_WIDTH + MOBILE_CARD_GAP;
    const index = Math.round(el.scrollLeft / step);
    const clampedIndex = Math.max(
      0,
      Math.min(index, mobileBenefits.length - 1),
    );

    setActiveIndex(clampedIndex);
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const step = MOBILE_CARD_WIDTH + MOBILE_CARD_GAP;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const targetLeft =
      index === mobileBenefits.length - 1 ? maxScrollLeft : index * step;

    el.scrollTo({ left: targetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  return (
    <div className="relative flex-1 lg:flex-[0.6] w-full">
      {/* Mobile: square transparent cards with horizontal scroll */}
      <div className="md:hidden mt-8 w-full">
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Product benefits"
          >
            {mobileBenefits.map((benefit, index) => (
              <div key={index} className="h-[240px] shrink-0 snap-start">
                <FeatureItem
                  variant="card"
                  ProductsBenefit={{
                    ...benefit,
                    image: benefit.imageMobile || benefit.image,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-[#1a2e28]/90 to-transparent"
            aria-hidden
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {mobileBenefits.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to benefit ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                activeIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>

      <Divider
        orientation="vertical"
        className="hidden lg:block absolute left-1/2 -top-2 -bottom-10 transform -translate-x-1/2 z-10"
      />

      <div className="hidden md:grid grid-cols-2 gap-12 lg:gap-16 xl:gap-20">
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="space-y-0 md:space-y-8 lg:space-y-10 pt-0 md:pt-6 lg:pt-14"
        >
          {benefits[0] && <FeatureItem ProductsBenefit={benefits[0]} />}
          <Divider className="my-6 md:my-6 lg:my-8" />
          {benefits[2] && <FeatureItem ProductsBenefit={benefits[2]} />}
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="800"
          className="space-y-0 md:space-y-8 lg:space-y-10"
        >
          {benefits[1] && <FeatureItem ProductsBenefit={benefits[1]} />}
          <Divider className="my-6 md:my-6 lg:my-8" />
          {benefits[3] && <FeatureItem ProductsBenefit={benefits[3]} />}
        </div>
      </div>
    </div>
  );
};

export default FeaturesGrid;
