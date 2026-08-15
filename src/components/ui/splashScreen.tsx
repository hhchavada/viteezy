"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import Lottie from "lottie-react";
import splashDesktop from "@/animations/splash_desktop.json";
import splashMobile from "@/animations/splash_mobile.json";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationData, setAnimationData] = useState<any>(null);

  useLayoutEffect(() => {
    // Check screen size to determine which animation asset to load
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setAnimationData(isMobile ? splashMobile : splashDesktop);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlScrollBehavior = html.style.scrollBehavior;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    const prevBodyPosition = body.style.position;

    // Disable scroll and interactions
    html.style.overflow = "hidden";
    html.style.scrollBehavior = "auto";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.scrollBehavior = prevHtmlScrollBehavior;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.touchAction = prevBodyTouchAction;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  const handleAnimationComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  return (
    <div
      role="presentation"
      aria-hidden
      className={`fixed inset-0 z-[9999] bg-[#1baf9a] w-screen h-screen max-h-[100dvh] transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      style={{
        willChange: "opacity",
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {animationData && (
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay={true}
          onComplete={handleAnimationComplete}
          className="w-full h-full"
          rendererSettings={{
            preserveAspectRatio: "xMidYMid slice",
          }}
          style={{
            width: "100vw",
            height: "100vh",
            maxHeight: "100dvh",
          }}
        />
      )}
    </div>
  );
}