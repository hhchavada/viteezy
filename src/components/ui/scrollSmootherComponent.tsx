"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function ScrollSmootherComponent() {
  const pathname = usePathname();

  // Keep a timestamp for throttling refresh calls to avoid refresh storms
  const lastRefreshRef = useRef<number>(0);

  // Detect iOS Safari specifically (covers modern iPhones / iPads running Safari)
  const isIOSSafari = (() => {
    if (typeof navigator === "undefined" || typeof window === "undefined")
      return false;
    const ua = navigator.userAgent || "";
    const platform = (navigator as any).platform || "";

    const isIOSPlatform =
      /iP(ad|hone|od)/.test(ua) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isWebKit =
      /AppleWebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

    return Boolean(isIOSPlatform && isWebKit);
  })();

  useEffect(() => {
    const shouldDisableSmoothScroll =
      pathname.startsWith("/checkout") || pathname.startsWith("/quiz");
    const wrapperEl = document.querySelector(
      "#smooth-wrapper",
    ) as HTMLElement | null;
    const contentEl = document.querySelector(
      "#smooth-content",
    ) as HTMLElement | null;

    if (shouldDisableSmoothScroll) {
      const existingSmoother = ScrollSmoother.get();
      if (existingSmoother) {
        existingSmoother.kill();
      }
      // Restore native scroll behavior for checkout so CSS sticky works.
      if (wrapperEl) {
        wrapperEl.style.overflow = "visible";
        wrapperEl.style.height = "auto";
        wrapperEl.style.position = "static";
        wrapperEl.style.width = "auto";
      }
      if (contentEl) {
        contentEl.style.willChange = "auto";
      }
      ScrollTrigger.refresh();
      return;
    }

    // Re-apply smoother container styles on non-checkout routes.
    if (wrapperEl) {
      wrapperEl.style.overflow = "hidden";
      wrapperEl.style.height = "100%";
      wrapperEl.style.position = "fixed";
      wrapperEl.style.width = "100%";
    }
    if (contentEl) {
      contentEl.style.willChange = "auto";
    }

    // Create or reuse the ScrollSmoother instance (keep layout/styles identical)
    let smoother = ScrollSmoother.get();

    if (!smoother) {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
        smoothTouch: 0.1,
        normalizeScroll: false,
      });
    }

    const refreshAnimations = () => {
      // Throttle refreshes to avoid refresh storms (ResizeObserver + frequent changes)
      const now = Date.now();
      const minInterval = 200; // ms
      if (now - lastRefreshRef.current < minInterval) return;
      lastRefreshRef.current = now;

      // Wait for the browser to finish layout so GSAP/AOS read correct positions.
      requestAnimationFrame(() => {
        // If smoother exists, refresh it; otherwise just refresh ScrollTrigger
        try {
          smoother?.refresh();
        } catch (e) {
          // swallow errors to avoid breaking page flow
        }
        ScrollTrigger.refresh();
      });
    };

    const handleResize = () => refreshAnimations();

    // Refresh when dynamic content changes height (e.g., empty -> results).
    // This is more robust than relying only on window resize.
    let resizeObserver: ResizeObserver | null = null;
    const smoothContentEl = document.querySelector(
      "#smooth-content",
    ) as HTMLElement | null;

    // Avoid attaching ResizeObserver on iOS Safari to prevent refresh storms
    if (
      !isIOSSafari &&
      smoothContentEl &&
      typeof ResizeObserver !== "undefined"
    ) {
      let t: number | undefined;
      resizeObserver = new ResizeObserver(() => {
        window.clearTimeout(t);
        t = window.setTimeout(() => refreshAnimations(), 50);
      });
      resizeObserver.observe(smoothContentEl);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
      const existingSmoother = ScrollSmoother.get();
      if (existingSmoother) {
        existingSmoother.kill();
      }
    };
  }, [pathname]);

  return null;
}
