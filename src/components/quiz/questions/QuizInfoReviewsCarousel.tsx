"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useCallback, useEffect, useRef } from "react";

import {
  resolveQuizImageUrl,
  type NormalizedInfoPageReview,
} from "./utils";

const TWEEN_FACTOR = 0.84;
const MIN_OPACITY = 0.38;
const MIN_SCALE = 0.94;
const DEFAULT_AUTO_SCROLL_SPEED = 1;

function numberInRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function StarRatingBar({ rating }: { rating: number }) {
  const safeRating = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div className="flex gap-1.5" aria-label={`${safeRating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < safeRating;

        return (
          <div key={index} className="relative size-6 shrink-0">
            <Image
              src="/quiz/Rectangle-path.svg"
              alt=""
              fill
              className={isFilled ? "object-contain" : "object-contain opacity-25"}
              aria-hidden
            />
            {isFilled ? (
              <Image
                src="/quiz/Shape.svg"
                alt=""
                width={17}
                height={16}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function TestimonialCard({ review }: { review: NormalizedInfoPageReview }) {
  const photoUrl = resolveQuizImageUrl(review.photo ?? undefined);
  const initial = review.reviewerName.charAt(0).toUpperCase();

  return (
    <article className="min-w-0 rounded-2xl bg-[#F7F6F0] p-5 sm:p-6">
      {(review.reviewerName || photoUrl) && (
        <div className="mb-4 flex items-center gap-3">
          {photoUrl ? (
            <div className="relative size-11 shrink-0 overflow-hidden rounded-md sm:size-12">
              <Image
                src={photoUrl}
                alt={review.reviewerName || "Reviewer"}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : review.reviewerName ? (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#D1D5DB] text-sm font-semibold text-[#6B7280] sm:size-12">
              {initial}
            </div>
          ) : null}
          {review.reviewerName ? (
            <span className="font-saans text-base font-bold leading-none text-black-color">
              {review.reviewerName}
            </span>
          ) : null}
        </div>
      )}

      {review.rating > 0 ? (
        <div className="mb-4">
          <StarRatingBar rating={review.rating} />
        </div>
      ) : null}

      {review.reviewDescription ? (
        <p className="text-left font-saans text-sm leading-[1.5] text-black-color sm:text-[15px]">
          {review.reviewDescription}
        </p>
      ) : null}
    </article>
  );
}

interface QuizInfoReviewsCarouselProps {
  reviews: NormalizedInfoPageReview[];
  autoScrollSpeed?: number;
  enableAutoScroll?: boolean;
}

export default function QuizInfoReviewsCarousel({
  reviews,
  autoScrollSpeed = DEFAULT_AUTO_SCROLL_SPEED,
  enableAutoScroll = true,
}: QuizInfoReviewsCarouselProps) {
  const autoScrollPlugin = useRef(
    AutoScroll({
      direction: "forward",
      speed: DEFAULT_AUTO_SCROLL_SPEED,
      startDelay: 0,
      stopOnInteraction: false,
      stopOnFocusIn: false,
      playOnInit: false,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: reviews.length > 1,
      align: "center",
      containScroll: false,
      dragFree: true,
      duration: 0,
    },
    reviews.length > 1 ? [autoScrollPlugin.current] : []
  );

  const tweenNodes = useRef<HTMLElement[]>([]);

  const setTweenNodes = useCallback(() => {
    if (!emblaApi) return;
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector<HTMLElement>("[data-review-tween]")!;
    });
  }, [emblaApi]);

  const tweenOpacity = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;

      if (engine.slideLooper.loopPoints.length > 0) {
        engine.slideLooper.loopPoints.forEach((loopItem) => {
          const target = loopItem.target();
          if (snapIndex === loopItem.index && target !== 0) {
            const sign = Math.sign(target);
            if (sign === -1) {
              diffToTarget = scrollSnap - (1 + scrollProgress);
            }
            if (sign === 1) {
              diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          }
        });
      }

      const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
      const opacity = numberInRange(tweenValue, MIN_OPACITY, 1);
      const scale = numberInRange(tweenValue, MIN_SCALE, 1);
      const tweenNode = tweenNodes.current[snapIndex];

      if (tweenNode) {
        tweenNode.style.opacity = String(opacity);
        tweenNode.style.transform = `scale(${scale})`;
      }
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes();
    tweenOpacity();

    emblaApi.on("reInit", setTweenNodes);
    emblaApi.on("reInit", tweenOpacity);
    emblaApi.on("scroll", tweenOpacity);
    emblaApi.on("slideFocus", tweenOpacity);
    emblaApi.on("select", tweenOpacity);

    return () => {
      emblaApi.off("reInit", setTweenNodes);
      emblaApi.off("reInit", tweenOpacity);
      emblaApi.off("scroll", tweenOpacity);
      emblaApi.off("slideFocus", tweenOpacity);
      emblaApi.off("select", tweenOpacity);
    };
  }, [emblaApi, setTweenNodes, tweenOpacity]);

  useEffect(() => {
    const plugin = autoScrollPlugin.current;
    if (!emblaApi || reviews.length <= 1) return;

    const syncAutoScroll = () => {
      plugin.options.speed = autoScrollSpeed;
      plugin.options.direction = "forward";

      if (enableAutoScroll) {
        plugin.reset();
        plugin.play(0);
      } else {
        plugin.stop();
      }
    };

    syncAutoScroll();
    emblaApi.on("reInit", syncAutoScroll);

    return () => {
      plugin.stop();
      emblaApi.off("reInit", syncAutoScroll);
    };
  }, [emblaApi, reviews.length, autoScrollSpeed, enableAutoScroll]);

  if (reviews.length === 0) return null;

  if (reviews.length === 1) {
    return (
      <div className="w-full max-w-[21rem]">
        <TestimonialCard review={reviews[0]} />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[18%] max-w-[7rem] bg-gradient-to-r from-[#F7F6F0] from-10% via-[#F7F6F0]/75 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[18%] max-w-[7rem] bg-gradient-to-l from-[#F7F6F0] from-10% via-[#F7F6F0]/75 to-transparent"
        aria-hidden
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="min-w-0 shrink-0 grow-0 basis-[82%] pl-3 sm:basis-[21rem] sm:pl-4"
            >
              <div
                data-review-tween
                className="origin-center will-change-[opacity,transform]"
              >
                <TestimonialCard review={review} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
