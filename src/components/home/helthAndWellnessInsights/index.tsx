"use client";

import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { insights } from "@/components/constants";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { BlogSection } from "@/store/api/types/landing.types";
import { formatDateWithTranslation } from "@/lib/utils";
import FallbackImage from "@/components/ui/fallbackImage";
import { useTranslations } from "next-intl";

const HealthAndWellnessInsights = ({ data }: { data?: BlogSection }) => {
  const t = useTranslations("Landing");
  const tMonths = useTranslations("Months");
  if (!data?.isEnabled || !Boolean(data?.blogs?.length > 0)) return null;
  return (
    <section className="section-pb sm:px-4 md:px-6 lg:px-8">
      <div className="w-section mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            data-aos="fade-up"
            className="heading-style text-black-color mb-3"
          >
            {data?.title || t("healthWellnessInsights")}
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="sub-heading-style text-black-color max-w-xl mx-auto text-lg"
          >
            {data?.description ||
              t("discoverExpertTips")}
          </p>
        </div>

        {/* Insights Slider */}
        <div className="relative w-full overflow-hidden mb-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="ml-0 sm:-ml-3 md:-ml-4 cursor-pointer select-none items-stretch">
              {data?.blogs?.map((insight, index) => (
                <CarouselItem
                  key={insight._id}
                  className="pl-4 sm:pl-3 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3 flex"
                >
                  <Card
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                    className="overflow-hidden transition-shadow duration-300 border-0 shadow-none py-0 rounded-none bg-transparent h-full sm:min-h-[520px] flex flex-col w-full"
                  >
                    <Link href={`/blog/${insight?._id}`}>
                      <div className="aspect-6/4 overflow-hidden radius-style">
                        <FallbackImage
                          width={495}
                          height={330}
                          src={insight?.coverImage}
                          alt={insight.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-2 gap-3 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-sm font-saans text-black-color ">
                          <span>{insight?.author || t("viteezy")}</span>
                          <span>|</span>
                          <span>
                            {formatDateWithTranslation(insight?.createdAt, "MMM DD, YYYY", tMonths)}
                          </span>
                        </div>
                        <h3 className="text-2xl font-saans font-medium text-black-color line-clamp-2">
                          {insight.title}
                        </h3>
                        <p className="text-black-color sub-heading-style text-base line-clamp-3">
                          {/* {insight.description} */}
                        </p>
                        <article className="flex-1 lg:max-w-3xl">
                          <div
                            className="blog-content line-clamp-3 overflow-hidden text-black-color text-base"
                            dangerouslySetInnerHTML={{
                              __html: insight?.description || "",
                            }}
                          />
                        </article>
                      </CardContent>
                    </Link>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* All Blog Button */}
        <div className="text-center">
          <Link href="/blog">
            <Button
              variant="elevate"
              size="elevate"
              animateText
              // className="flex bg-black-color backdrop-blur-sm rounded-full border border-white/20 mx-auto w-fit"
            >
              {t("allBlogs")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default memo(HealthAndWellnessInsights);
