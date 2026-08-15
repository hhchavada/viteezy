"use client";

import { useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import logoAnimation from "@/animations/logo.json";

interface LogoAnimationProps {
  className?: string;
  width?: string;
  height?: string;
  speed?: number;
}

export default function LogoAnimation({
  className = "",
  width = "260px",
  height = "90px",
  speed = 1,
}: LogoAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Play forward once on mount
  useEffect(() => {
    if (lottieRef.current) {
      const player = lottieRef.current;
      player.setDirection(1);
      player.play();
    }
  }, []);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      const player = lottieRef.current;
      player.setDirection(-1);
      player.play(); // Reverses from current frame (smooth & instant)
    }
  };

  const handleMouseLeave = () => {
    if (lottieRef.current) {
      const player = lottieRef.current;
      player.setDirection(1);
      player.play(); // Plays forward from current frame
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`cursor-pointer ${className}`}
      style={{ width, height }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={logoAnimation}
        loop={false}
        autoplay={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
