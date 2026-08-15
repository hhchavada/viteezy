"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CounterProps {
  value: string;
  label: string;
  duration?: number;
}

export default function Counter({ value, label, duration = 2 }: CounterProps) {
  const t = useTranslations("Landing");
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);

  // Track if we already animated this specific value
  const animatedValueRef = useRef<string | null>(null);

  const parseValue = (val: string): { number: number; suffix: string } => {
    if (val.toLowerCase().includes("star")) {
      const num = parseInt(val.match(/\d+/)?.[0] || "0");
      return { number: num, suffix: " " + t("star") };
    }
    const match = val.match(/([\d.]+)(.*)/);
    if (match) {
      return { number: parseFloat(match[1]), suffix: match[2] || "" };
    }
    return { number: 0, suffix: "" };
  };

  const { number: targetValue, suffix } = parseValue(value);

  useEffect(() => {
    if (!counterRef.current) return;

    // ✅ If value changed, allow re-animation
    if (animatedValueRef.current !== value) {
      // Reset for new animation
      setDisplayValue(0);
      animatedValueRef.current = value;

      // Kill old triggers on this element to prevent conflicts
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === counterRef.current) st.kill();
      });
    } else {
      // If same value, keep current display (don't reset to 0)
      return;
    }

    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          const obj = { value: 0 };
          const hasDecimal = targetValue % 1 !== 0;
          
          gsap.to(obj, {
            value: targetValue,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
              if (hasDecimal) {
                setDisplayValue(parseFloat(obj.value.toFixed(1)));
              } else {
                setDisplayValue(Math.floor(obj.value));
              }
            },
            onComplete: () => setDisplayValue(targetValue),
          });
        },
      });
    }, counterRef);

    return () => ctx.revert();
  }, [value, duration, targetValue]);

  return (
    <div ref={counterRef} className="text-center flex flex-col gap-1">
      <span className="text-[32px] font-semibold font-saans text-black-color text-center">
        {displayValue.toLocaleString(undefined, { 
          minimumFractionDigits: targetValue % 1 !== 0 ? 1 : 0, 
          maximumFractionDigits: targetValue % 1 !== 0 ? 1 : 0 
        })}
        {suffix}
      </span>
      <span className="font-medium max-w-56 md:text-sm text-black-color w-full text-center leading-snug block mx-auto break-all truncate">
        {label}
      </span>
    </div>
  );
}
