"use client";

import { cn } from "@/lib/utils";

interface BouncingDotsLoaderProps {
  className?: string;
  dotClassName?: string;
}

const DOT_DELAYS_MS = [0, 150, 300] as const;

export default function BouncingDotsLoader({
  className,
  dotClassName = "bg-current",
}: BouncingDotsLoaderProps) {
  return (
    <span
      className={cn("inline-flex items-center justify-center gap-1", className)}
      aria-hidden
    >
      {DOT_DELAYS_MS.map((delay) => (
        <span
          key={delay}
          className={cn("size-1.5 rounded-full animate-bounce sm:size-2", dotClassName)}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
