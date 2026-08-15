"use client";

import { ImageOff } from "lucide-react";

import FallbackImage from "@/components/ui/fallbackImage";
import { cn } from "@/lib/utils";

interface RecommendationProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function RecommendationProductImage({
  src,
  alt,
  className,
}: RecommendationProductImageProps) {
  const imageUrl = src?.trim();

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-[#F0F0F0]",
          className
        )}
      >
        <ImageOff className="size-7 text-neutral-400" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <FallbackImage
      src={imageUrl}
      alt={alt}
      fill
      className={cn("object-cover", className)}
    />
  );
}
