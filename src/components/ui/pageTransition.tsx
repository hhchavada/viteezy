"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
  duration?: number; // Animation duration in seconds (default: 0.6)
}

export default function PageTransition({
  children,
  duration = 0.6,
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Set initial state - invisible with brightness 0
    gsap.set(container, {
      opacity: 0,
      // filter: "brightness(0)",
      willChange: "opacity, filter",
    });

    // Small delay to ensure DOM is ready, especially on first load
    const delay = hasAnimated.current ? 0 : 0.1;

    // Animate to visible with brightness and opacity
    const tl = gsap.timeline({
      delay: delay,
    });

    tl.to(container, {
      opacity: 1,
      // filter: "brightness(1)",
      duration: duration,
      ease: "power2.out",
      onComplete: () => {
        // Remove will-change for performance
        gsap.set(container, {
          willChange: "auto",
        });
        hasAnimated.current = true;
      },
    });

    // Cleanup on unmount
    return () => {
      tl.kill();
    };
  }, [pathname, duration]); // Re-trigger on route change

  return (
    <div
      ref={containerRef}
      className="w-full min-h-full"
    >
      {children}
    </div>
  );
}
