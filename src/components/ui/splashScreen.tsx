"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import splashAnimation from "@/animations/splash.json";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
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
      className={`fixed inset-0 z-[9999] bg-[#1baf9a] w-screen h-screen max-h-[100dvh] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
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
      <Lottie
        animationData={splashAnimation}
        loop={false}
        autoplay={true}
        onComplete={handleAnimationComplete}
        className="w-full h-full"
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
        style={{ width: "100vw", height: "100vh", maxHeight: "100dvh" }}
      />
    </div>
  );
}
