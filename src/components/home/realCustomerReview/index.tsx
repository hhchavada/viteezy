"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useGetProductTestimonialsQuery } from "@/store";
import type { TestimonialsSection } from "@/store/api/types/landing.types";
import { useRouter } from "next/navigation";
import FallbackImage from "@/components/ui/fallbackImage";
import { getCurrencySymbol, resolveLocalizedValue } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

function RealCustomerReview({
  productId,
  data,
  testimonials: testimonialsFromProduct,
}: {
  productId?: string;
  data?: TestimonialsSection;
  /** Testimonials from product details API - avoids separate testimonials API call */
  testimonials?: Array<{
    _id?: string;
    videoUrl?: string | null;
    videoThumbnail?: string | null;
    products?: Array<{
      _id?: string;
      title?: string;
      productImage?: string;
      sachetPrices?: {
        thirtyDays?: { amount?: number; discountedPrice?: number };
      };
      price?: { amount?: number; currency?: string };
    }>;
  }>;
}) {
  const locale = useLocale();
  const t = useTranslations("Landing");
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const route = useRouter();

  // Only fetch when not using product details testimonials
  const { data: testimonialsData } = useGetProductTestimonialsQuery(productId, {
    skip: !productId || !!testimonialsFromProduct?.length,
  });

  const testimonialsList = testimonialsFromProduct?.length
    ? testimonialsFromProduct
    : testimonialsData?.data || data?.testimonials || [];

  const syncFromApi = React.useCallback(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    syncFromApi();
    api.on("select", syncFromApi);
    api.on("reInit", syncFromApi);
    return () => {
      api.off("select", syncFromApi);
      api.off("reInit", syncFromApi);
    };
  }, [api, syncFromApi]);

  const segmentWidthPercent = count > 0 ? 100 / count : 0;
  const thumbLeftPercent = count > 0 ? (current - 1) * segmentWidthPercent : 0;

  // Click on bar to navigate to slide
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!api || count === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    const targetSlide = Math.min(
      Math.floor(clickPercentage * count),
      count - 1
    );
    api.scrollTo(Math.max(0, targetSlide));
  };

  // Map testimonials to UI-friendly structure
  const reviews = testimonialsList.map((item: any) => {
    const firstProduct = item?.products?.[0] || {};
    const sachet = firstProduct?.sachetPrices?.thirtyDays || {};
    return {
      id: item?._id,
      videoUrl: item?.videoUrl,
      videoThumbnail: item?.videoThumbnail,
      productName: resolveLocalizedValue(firstProduct?.title, locale) || "",
      image: firstProduct?.productImage || "/placeholder-avatar.jpg",
      price:
        typeof sachet?.discountedPrice === "number"
          ? sachet.discountedPrice
          : firstProduct?.price?.amount ?? null,
      originalPrice:
        typeof sachet?.amount === "number"
          ? sachet.amount
          : firstProduct?.price?.amount ?? null,
    };
  });

  const isFewReviews = reviews.length > 0 && reviews.length < 4;

  const handleClick = (item?: any) => {
    if (item?._id) {
      route.push(`/products/${item?._id}`);
    }
  };
  if (data && !data.isEnabled) return null;
  const hasTestimonials =
    (testimonialsFromProduct?.length ?? 0) > 0 ||
    (data?.testimonials?.length ?? 0) > 0;
  if (!hasTestimonials) return null;

  return (
    <section className="section-py sm:px-4">
      <div className="w-section mx-auto px-0 xl:px-14">
        {/* Header */}
        <div className="text-center mb-4 3xl:mb-8">
          <h2
            data-aos="fade-up"
            className="heading-style font-saans text-charcol-color mb-4 3xl:text-[42px] wrap-break-word line-clamp-2"
          >
            {data?.title || t("testimonialsTitleFallback")}
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="sub-heading-style! font-saans text-charcol-color max-w-2xl text-xl md:text-lg line-clamp-3 mx-auto 3xl:text-xl wrap-break-word line-clamp-3"
          >
            {data?.subTitle || t("testimonialsSubtitleFallback")}
          </p>
        </div>
        <div className="pt-4 md:pt-8 pb-4">
          {/* Carousel */}
          <div className="relative ">
            <Carousel
              setApi={setApi}
              opts={{
                align: isFewReviews ? "center" : "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent
                className={`ml-2 sm:-ml-4 items-stretch ${
                  isFewReviews ? "justify-center" : ""
                }`}
              >
                {testimonialsList.map((review: any, index: number) => {
                  const product = review.products?.[0] || {};
                  return (
                    <CarouselItem
                      key={index}
                      className="pl-3 md:pl-4 basis-5/7 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 flex"
                    >
                      <Card
                        data-aos="fade-up"
                        data-aos-delay={index * 200}
                        className="rounded-2xl overflow-hidden h-full transition-all duration-300 shadow-none border-0 bg-muted radius-style py-0 flex flex-col"
                      >
                        <CardContent
                          className="relative p-0 flex flex-col h-full cursor-pointer"
                          onClick={() => handleClick(product)}
                        >
                          {/* Video/GIF Section */}
                          <div className="aspect-3/5 overflow-hidden relative">
                            {review.videoUrl ? (
                              <video
                                src={review.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                poster="/videoThumb.webp"
                              />
                            ) : (
                              <FallbackImage
                                width={276}
                                height={460}
                                src={
                                  review.videoThumbnail ||
                                  "/placeholder-video.jpg"
                                }
                                alt={`testimonial`}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            )}
                          </div>

                          {/* Product Info Section */}
                          <div className="absolute bottom-2 left-2 right-2 bg-[#FAF9F6] rounded-lg px-1 py-1">
                            <div className="flex items-center gap-3">
                              <div className=" bg-gray-100 rounded-md shrink-0">
                                <FallbackImage
                                  src={
                                    product?.productImage ||
                                    "/placeholder-avatar.jpg"
                                  }
                                  alt={`testimonial`}
                                  width={64}
                                  height={64}
                                  className="rounded-md object-cover w-14 h-14"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                <p className="text-sm font-medium text-black-color font-saans 3xl:text-base line-clamp-1 wrap-break-word">
                                  {resolveLocalizedValue(product?.title, locale)}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium font-saans text-black-color 3xl:text-sm">
                                    {(() => {
                                      const p = product as any;
                                      const amount =
                                        p?.sachetPrices?.thirtyDays
                                          ?.discountedPrice ??
                                        p?.price?.amount ??
                                        (typeof p?.price === "number"
                                          ? p.price
                                          : null);
                                      if (amount == null) return null;
                                      return `${getCurrencySymbol(
                                        p?.price?.currency
                                      )}${
                                        typeof amount === "number"
                                          ? amount.toFixed(2)
                                          : amount
                                      }`;
                                    })()}
                                  </span>
                                  <span className="text-xs font-saans text-light-slate-color line-through 3xl:text-sm">
                                    {(() => {
                                      const p = product as any;
                                      const orig =
                                        p?.sachetPrices?.thirtyDays?.amount ??
                                        p?.originalPrice;
                                      if (orig == null) return null;
                                      return `${getCurrencySymbol(
                                        p?.price?.currency
                                      )}${
                                        typeof orig === "number"
                                          ? orig.toFixed(2)
                                          : orig
                                      }`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Progress bar: fixed-width thumb per slide, thumb moves with current slide */}
          <div className="mt-10 flex justify-center px-4 sm:px-6 md:px-0">
            <div
              className="w-full max-w-md h-1 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors relative"
              onClick={handleProgressBarClick}
            >
              <div
                className="absolute top-0 h-full bg-deep-teal-color transition-all duration-300 ease-out"
                style={{
                  width: `${segmentWidthPercent}%`,
                  left: `${thumbLeftPercent}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(RealCustomerReview);
