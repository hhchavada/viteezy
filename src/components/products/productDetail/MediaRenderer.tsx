"use client";
import { getMediaType, isRemoteImageUrl } from "@/lib/utils";
import FallbackImage from "@/components/ui/fallbackImage";

interface MediaRendererProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

export const MediaRenderer = ({
  src,
  alt,
  width,
  height,
  className,
}: MediaRendererProps) => {
  const mediaType = getMediaType(src);

  if (mediaType === "video") {
    return (
      <video
        src={src}
        width={width}
        height={height}
        className={className}
        autoPlay
        loop
        muted
        playsInline
        poster="/videoThumb.webp"
      />
    );
  }

  // For both regular images and GIFs, use FallbackImage (shows standard
  // fallback when the image is missing or fails to load)
  return (
    <FallbackImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={mediaType === "gif" || isRemoteImageUrl(src)}
    />
  );
};
