"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  zIndex?: number;
  size?: "sm" | "md" | "lg";
  overlay?: boolean;
  children?: React.ReactNode;
}

export default function Loading({
  className,
  zIndex = 10,
  size = "md",
  overlay = true,
  children,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinnerSizeClasses = {
    sm: "border-2",
    md: "border-3",
    lg: "border-4",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-start justify-center h-full",
        overlay && "bg-black/10 backdrop-blur-xs",
        className
      )}
      style={{ zIndex }}
    >
      {children || (
        <div className="w-full h-full relative">
          <div className="max-h-screen w-full h-full flex items-center justify-center sticky top-0">
            <div
              className={cn(
                "animate-spin rounded-full border-gray-500 border-t-transparent",
                sizeClasses[size],
                spinnerSizeClasses[size]
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
