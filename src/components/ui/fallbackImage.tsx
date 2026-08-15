"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

type FallbackImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  /** Optional override. When omitted, failed/missing images use the standard placeholder UI. */
  fallbackSrc?: string;
};

function resolveNextImageSrc(
  src: string | null | undefined
): string | null {
  const trimmed = typeof src === "string" ? src.trim() : "";
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) return trimmed;

  const absolute = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  if (/^https?:\/\//i.test(absolute)) {
    try {
      new URL(absolute);
      return absolute;
    } catch {
      return null;
    }
  }

  return null;
}

function StandardImageFallback({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-100",
        className
      )}
      role="img"
      aria-label={alt}
    >
      <ImageOff className="size-8 text-neutral-400" aria-hidden />
    </div>
  );
}

export default function FallbackImage({
  src,
  alt,
  className = "",
  fill = false,
  fallbackSrc,
  unoptimized,
  quality = 65,
  ...props
}: FallbackImageProps) {
  const resolvedFallback = resolveNextImageSrc(fallbackSrc);
  const resolvedSrc = resolveNextImageSrc(src);
  const initialSrc = resolvedSrc ?? resolvedFallback;
  const initialIsFallback = !resolvedSrc && !!resolvedFallback;

  const [currentSrc, setCurrentSrc] = useState<string | null>(initialSrc);
  const [showStandardFallback, setShowStandardFallback] = useState(!initialSrc);
  const [isFallback, setIsFallback] = useState(initialIsFallback);
  const [forceUnoptimized, setForceUnoptimized] = useState(false);

  useEffect(() => {
    const nextResolvedSrc = resolveNextImageSrc(src);
    const nextSrc = nextResolvedSrc ?? resolvedFallback;
    setCurrentSrc(nextSrc);
    setShowStandardFallback(!nextSrc);
    setIsFallback(!nextResolvedSrc && !!resolvedFallback);
    setForceUnoptimized(false);
  }, [src, fallbackSrc, resolvedFallback]);

  if (showStandardFallback || !currentSrc) {
    return <StandardImageFallback alt={alt} className={className} />;
  }

  return (
    <Image
      quality={quality}
      {...props}
      src={currentSrc}
      alt={alt}
      fill={fill}
      unoptimized={unoptimized || forceUnoptimized || isFallback}
      className={className}
      onError={() => {
        if (!unoptimized && !forceUnoptimized && !isFallback) {
          setForceUnoptimized(true);
          return;
        }
        if (resolvedFallback && currentSrc !== resolvedFallback) {
          setCurrentSrc(resolvedFallback);
          setIsFallback(true);
          setForceUnoptimized(false);
          return;
        }
        setShowStandardFallback(true);
      }}
    />
  );
}
