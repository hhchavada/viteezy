"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { REASONS } from "./constants";

function ReasonCard({
  icon,
  title,
  description,
}: (typeof REASONS)[number]) {
  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white p-5 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="mb-4 flex h-16 w-full shrink-0 items-start justify-center sm:justify-start lg:justify-start">
        <Image
          src={icon}
          alt=""
          width={64}
          height={64}
          className="size-16 object-contain"
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-saans text-lg font-semibold leading-snug text-black-color lg:text-xl">
          {title}
        </h3>
        <p className="font-saans text-sm leading-normal text-black-color/90 lg:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function MembershipReasons() {
  return (
    <section className="flex flex-col items-center gap-8 pt-0 pb-12 lg:gap-12 lg:pb-20">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="font-saans text-2xl font-medium text-charcol-color lg:text-[28px]">
          Five reasons to join
        </h2>
        <p className="text-center font-saans text-sm text-charcol-color lg:text-base">
          Every benefit is designed for households where wellness is shared —
          not solo.
        </p>
      </div>

      {/* Mobile carousel */}
      <div className="relative w-full overflow-hidden sm:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 items-stretch">
            {REASONS.map((reason) => (
              <CarouselItem
                key={reason.title}
                className="flex basis-[88%] pl-4 sm:basis-1/2"
              >
                <ReasonCard {...reason} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Desktop grid — unchanged */}
      <div className="hidden w-full grid-cols-1 items-stretch gap-4 sm:grid sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        {REASONS.map((reason) => (
          <ReasonCard key={reason.title} {...reason} />
        ))}
      </div>
    </section>
  );
}
