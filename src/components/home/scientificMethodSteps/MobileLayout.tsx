"use client";

import React, { useRef, useState } from "react";
import MobileStep from "./MobileStep";
import { DesignedByScienceSection } from "@/store/api/types/landing.types";

const MOBILE_STEP_GAP = 16;

const MobileLayout = ({ data }: { data?: DesignedByScienceSection }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const steps = data?.steps ?? [];

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) {
      setActiveIndex(0);
      return;
    }

    if (el.scrollLeft >= maxScrollLeft - 8) {
      setActiveIndex(steps.length - 1);
      return;
    }

    const scrollStep = el.clientWidth + MOBILE_STEP_GAP;
    const index = Math.round(el.scrollLeft / scrollStep);
    setActiveIndex(Math.max(0, Math.min(index, steps.length - 1)));
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const scrollStep = el.clientWidth + MOBILE_STEP_GAP;
    const targetLeft =
      index === steps.length - 1 ? maxScrollLeft : index * scrollStep;

    const start = el.scrollLeft;
    const distance = targetLeft - start;
    const duration = 700;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.scrollLeft = start + distance * eased;
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setActiveIndex(index);
      }
    };

    requestAnimationFrame(animate);
  };

  if (steps.length === 0) return null;

  const showScrollHint = steps.length > 1;

  return (
    <div className="md:hidden">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-proximity scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={data?.title || "Science steps"}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className="w-full shrink-0 snap-center snap-always pt-4"
            >
              <MobileStep step={step} index={index} />
            </div>
          ))}
        </div>

        {showScrollHint && activeIndex < steps.length - 1 && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-pastel-yellow-color via-pastel-yellow-color/80 to-transparent"
            aria-hidden
          />
        )}
      </div>

      {showScrollHint && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to step ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                activeIndex === index
                  ? "w-5 bg-charcol-color"
                  : "w-1.5 bg-charcol-color/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
