import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { products } from "@/components/constants";
import { useTranslations } from "next-intl";
import { ProductCategorySection } from "@/store/api/types/landing.types";
import Link from "next/link";
import FallbackImage from "@/components/ui/fallbackImage";

function HealthDiscovery({ data }: { data?: ProductCategorySection }) {
  const t = useTranslations("Landing");
  if (!data?.isEnabled) return null;
  return (
    <section className="section-py  xl:px-4 bg-white">
      <div className=" mx-auto px-0">
        {/* Header */}
        <div className="text-center mb-12 w-section">
          <h2
            data-aos="fade-up"
            className="heading-style text-charcol-color mb-3"
          >
            {data?.title || t("discoverWhatFitsYourHealth")}
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="sub-heading-style  text-charcol-color max-w-2xl mx-auto"
          >
            {data?.description || t("healthDiscoveryDescriptionFallback")}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative w-section px-0 sm:px-4 xl:px-11 2xl:px-8 3xl:px-4">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="xl:w-[calc(100%-60px)] mx-auto 3xl:px-3"
          >
            <CarouselContent className="ml-0.25 sm:-ml-4 items-stretch">
              {data?.productCategories?.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3 flex"
                >
                  <Card
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                    className="border-0 shadow-none rounded-xl overflow-hidden h-full w-full min-h-0 md:min-h-[420px] py-0 flex flex-col"
                  >
                    <CardContent className="p-0 flex flex-col flex-1 h-full">
                      {/* Product Image */}
                      <div className="relative bg-gray-50 shrink-0">
                        <div className="w-full flex justify-center items-center">
                          <FallbackImage
                            src={product?.image?.url || ""}
                            alt={product?.name}
                            width={457}
                            height={300}
                            className="object-cover w-full h-[220px] sm:h-[275px] 3xl:h-[300px]"
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="text-center bg-off-white-color px-4 sm:px-6 pt-4 md:pt-6.5 pb-4 md:pb-7.5 flex flex-col flex-1">
                        <div className="flex flex-col gap-1.5 flex-1 min-h-[4.5rem] md:min-h-0">
                          <h3 className="text-xl 3xl:text-[22px] font-saans font-semibold text-gray-900 line-clamp-1">
                            {product?.name || t("supplements")}
                          </h3>
                          <p className="leading-snug text-sm sm:text-base line-clamp-2 text-charcol-color">
                            {product.description}
                          </p>
                        </div>

                        {/* Button */}
                        <Link
                          href={`/products?categories=${product.slug}`}
                          className="mt-3 shrink-0"
                        >
                          <Button
                            variant="elevate"
                            size="elevate-md"
                            animateText
                            className="max-w-full mx-auto py-5 sm:py-6 px-7 font-semibold"
                          >
                            <span className="truncate break-all block">
                              {t("shop") + " " + (product?.name || "")}
                            </span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Buttons */}
            <CarouselPrevious className="absolute hidden xl:flex cursor-pointer -left-13 top-1/2 -translate-y-1/2 bg-off-white-color hover:text-white  hover:bg-black! size-10 3xl:size-12 border-0" />
            <CarouselNext className="absolute hidden xl:flex cursor-pointer -right-13 top-1/2 -translate-y-1/2 bg-off-white-color hover:text-white  hover:bg-black! size-10 3xl:size-12 border-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HealthDiscovery);
