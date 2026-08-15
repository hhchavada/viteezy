"use client";

import React from "react";
import { benefitsData } from "@/components/constants";
import BenefitCard from "./BenefitCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MembershipBenefit } from "@/store/api/types/landing.types";

const BenefitsSlider = ({ data }: { data: MembershipBenefit[] }) => {
  return (
    <div className="relative w-full  overflow-hidden">
      <Carousel
        opts={{
          align: "center", // This is the key!
          loop: false,
          // Optional: start from the first real item (not dummy)
          startIndex: 0,
        }}
        className="w-full"
      >
        <CarouselContent className="ml-[calc((100%-96%)/2)] items-stretch">
          {" "}
          {/* 66.666% = 2/3 basis */}
          {data.map((benefit, index) => (
            <CarouselItem
              key={"benefits"+index}
              className="pl-4 basis-2/3 sm:basis-3/5 flex" // pl-4 for consistent gap
            >
              <div
                data-aos="fade-left"
                data-aos-delay="600"
                className="w-full bg-white/10 backdrop-blur-lg rounded-2xl px-7 pt-2 min-h-[180px] flex flex-col"
              >
                <BenefitCard benefit={benefit} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default BenefitsSlider;
