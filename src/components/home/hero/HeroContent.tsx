"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import HeroButton from "./HeroButton";
import { HeroSection } from "@/store/api/types/landing.types";
import { usePreviewUrl, usePreviewUrls } from "@/hooks/usePreviewUrl";
import { useTranslations } from "next-intl";

export default function HeroContent({ data }: { data?: HeroSection }) {
  const t = useTranslations("Landing");

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);

  const bgUrl = usePreviewUrl(data?.backgroundImage);

  const ctaImageInputs = useMemo(
    () => (data?.primaryCTA ?? []).map((cta) => cta?.image),
    [data?.primaryCTA]
  );

  const ctaImages = usePreviewUrls(ctaImageInputs);

  const phrases = useMemo(
    () =>
      data?.highlightedText || [
        t("yourIntestines"),
        t("yourEnergy"),
        t("yourStress"),
      ],
    [data?.highlightedText, t]
  );

  const btnColor = ["bg-black", "bg-soft-orange", "bg-teal-500"];

  // ✅ GSAP vertical slider (forward + smooth reset)
  useEffect(() => {
    if (!trackRef.current || !sliderRef.current) return;

    const total = phrases.length;
    let sliderHeight = sliderRef.current.offsetHeight;

    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power3.inOut" },
    });

    // forward slide
    for (let i = 1; i < total; i++) {
      tl.to(trackRef.current, {
        y: -(i * sliderHeight),
        duration: 0.7,
      }).to({}, { duration: 1.3 });
    }

    // ✅ smooth return to first phrase
    tl.to(trackRef.current, {
      y: 0,
      duration: 0.8,
    }).to({}, { duration: 1.3 });

    // ✅ handle resize properly
    const handleResize = () => {
      sliderHeight = sliderRef.current?.offsetHeight || 0;
      gsap.set(trackRef.current, { y: 0 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      tl.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, [phrases]);

  return (
    <div ref={containerRef} className="relative lg:min-h-full">
      <Image
        src={bgUrl || "/heroRight.png"}
        className="h-full w-full object-cover absolute hidden md:block"
        alt={t("heroBgImage")}
        width={600}
        height={400}
        priority
        quality={65}
      />

      <div className="px-4 sm:px-6 md:px-8 lg:px-11 xl2:px-16 py-5 pb-5 sm:py-12 sm:pb-12 md:py-16 lg:py-24 xl:py-40 relative z-10 h-full flex flex-col justify-center">
        {/* Title */}
        <h1 className="text-[1.65rem] sm:text-4xl md:text-5xl xl:text-[60px] leading-tight mb-3 sm:mb-4 text-center sm:text-left">
          {/* Title */}
          <span className="font-saans font-medium block sm:inline">
            {data?.title}
          </span>

          {/* Rotating Text */}
          <span
            ref={sliderRef}
            className="block sm:inline-flex overflow-hidden mt-1 sm:mt-0 sm:ml-2 justify-center sm:justify-start"
            style={{ height: "1.2em" }}
          >
            <span
              ref={trackRef}
              className="flex flex-col items-center sm:items-start"
              style={{ willChange: "transform" }}
            >
              {phrases.map((phrase, idx) => (
                <span
                  key={idx}
                  className="text-teal-500 font-saans whitespace-nowrap "
                  style={{
                    height: "1.2em",
                    lineHeight: "1.2em",
                  }}
                >
                  {phrase}
                </span>
              ))}
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl font-saans max-w-xl mb-3 sm:mb-6 text-center sm:text-start line-clamp-2 break-words">
          {data?.description}
        </p>

        {/* Buttons */}
        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 max-w-[380px] mx-auto md:max-w-none md:mx-0 md:flex md:flex-wrap md:gap-2 md:justify-center xl:justify-start">
          {data?.primaryCTA?.slice(0, 3)?.map((btn, idx) => {
            if (!btn?.label) return null;

            return (
              <div
                key={idx}
                className={`flex justify-center ${idx === 2 ? "col-span-2" : ""} md:contents`}
              >
                <HeroButton
                  img={ctaImages[idx] || btn?.image}
                  btnTxt={btn?.label}
                  bg={btnColor[idx]}
                  link={btn?.link}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
