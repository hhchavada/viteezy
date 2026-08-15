// components/AOSWrapper.tsx
"use client";

import { ReactNode, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AOSWrapperProps {
  children: ReactNode;
}

export default function AOSWrapper({ children }: AOSWrapperProps) {
  useEffect(() => {
    // Initialize AOS only on client
    AOS.init({
      duration: 800, // animation duration
      easing: "ease-out", // default easing
      once: true, // animate only once (recommended)
      mirror: false, // don't animate again when scrolling back
      offset: 100, // trigger 100px before element enters viewport
      delay: 0,
      anchorPlacement: "top-bottom",
    });

    const refreshAOS = () => {
      // refreshHard recalculates element positions and clears AOS' internal cache.
      requestAnimationFrame(() => AOS.refreshHard());
    };

    // Refresh AOS on window resize (fixes issues with dynamic content)
    const handleResize = () => refreshAOS();
    window.addEventListener("resize", handleResize);

    // Refresh AOS when layout changes size under ScrollSmoother.
    // This is important when toggling between search results and an empty state.
    let resizeObserver: ResizeObserver | null = null;
    const smoothContentEl = document.querySelector(
      "#smooth-content"
    ) as HTMLElement | null;
    if (smoothContentEl && typeof ResizeObserver !== "undefined") {
      let t: number | undefined;
      resizeObserver = new ResizeObserver(() => {
        window.clearTimeout(t);
        t = window.setTimeout(() => refreshAOS(), 50);
      });
      resizeObserver.observe(smoothContentEl);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  return <>{children}</>;
}
