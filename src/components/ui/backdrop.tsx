"use client";

import React, { useEffect, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { X } from "../icons";
import { cn } from "@/lib/utils";

interface BackdropProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  zIndex?: number;
  handleScrollLock?: boolean;
  transitionDuration?: number;
  closeOnHover?: boolean;
}

/** Nested dialogs share one page-level lock so closing an overlay doesn't unlock early. */
let pageScrollLockCount = 0;

function lockPageScroll() {
  pageScrollLockCount += 1;
  if (pageScrollLockCount !== 1) return;

  const html = document.documentElement;
  const body = document.body;
  html.dataset.prevOverflow = html.style.overflow;
  body.dataset.prevOverflow = body.style.overflow;
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  const smoother = ScrollSmoother.get();
  if (smoother) {
    body.dataset.prevSmootherPaused = String(smoother.paused());
    smoother.paused(true);
  }
}

function unlockPageScroll() {
  pageScrollLockCount = Math.max(0, pageScrollLockCount - 1);
  if (pageScrollLockCount !== 0) return;

  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = html.dataset.prevOverflow ?? "";
  body.style.overflow = body.dataset.prevOverflow ?? "";
  delete html.dataset.prevOverflow;
  delete body.dataset.prevOverflow;

  const smoother = ScrollSmoother.get();
  if (smoother && body.dataset.prevSmootherPaused !== undefined) {
    smoother.paused(body.dataset.prevSmootherPaused === "true");
    delete body.dataset.prevSmootherPaused;
  }
}

const Backdrop: React.FC<BackdropProps> = ({
  isOpen,
  onClose,
  className = "",
  zIndex = 40,
  handleScrollLock = true,
  transitionDuration = 500,
  closeOnHover = false,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Scroll lock — body + ScrollSmoother (settings pages use GSAP smooth scroll)
  useEffect(() => {
    if (!handleScrollLock || !isOpen) return;

    lockPageScroll();
    return () => {
      unlockPageScroll();
    };
  }, [isOpen, handleScrollLock]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleClose = () => {
    onClose();
    setMousePosition({ x: -100, y: -100 });
    setIsVisible(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity",
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
        className
      )}
      style={{
        zIndex,
        transitionDuration: `${transitionDuration}ms`,
        cursor: "none",
      }}
      onClick={handleClose}
      onMouseEnter={closeOnHover ? handleClose : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cursor Close Icon */}
      <div
        className={cn(
          "fixed transition-opacity duration-200 pointer-events-none",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <X className="h-12 w-12 text-black bg-white rounded-full p-3" />
      </div>
    </div>
  );
};

export default Backdrop;
