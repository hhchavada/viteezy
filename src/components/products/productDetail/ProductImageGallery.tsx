"use client";
import Image from "next/image";
import { MediaRenderer } from "./MediaRenderer";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/components/types";
import { ReadMoreDialog } from "./ReadMoreDialog";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface ProductImageGalleryProps {
  product: Product;
  productData?: any;
  selectedPreference?: "sachets" | "pouch";
}

export default function ProductImageGallery({
  product,
  productData,
  selectedPreference,
}: ProductImageGalleryProps) {
  // Determine which images to show based on preference
  const hasPouchImages = Array.isArray(productData?.standupPouchImages) && (productData?.standupPouchImages?.length ?? 0) > 0;
  
  let mobileImages: string[];
  if (selectedPreference === "pouch" && hasPouchImages) {
    // Show standupPouchImages when pouch is selected
    mobileImages = productData.standupPouchImages;
  } else {
    // Show default gallery images for sachets or when pouch images are not available
    const preferenceImage = productData?.productImage || product.images.front;
    mobileImages = [preferenceImage, ...product.images.gallery];
  }

  const mainImage = mobileImages[0] || product.images.front;

  // Mobile carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width === 0) return;
    const index = Math.round(el.scrollLeft / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
    setActiveIndex(index);
  };

  const galleryImages = mobileImages.slice(1);
  const firstThumb = galleryImages[0];
  const secondThumb = galleryImages[1];
  const remainingCount = Math.max(0, mobileImages.length - 3);

  const renderThumbnail = (
    image: string,
    galleryIndex: number,
    options?: { showMoreOverlay?: boolean },
  ) => (
    <div
      className="relative aspect-square rounded-lg overflow-hidden transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-300"
    >
      <MediaRenderer
        src={image}
        alt=""
        width={150}
        height={150}
        className="absolute inset-0 w-full h-full object-cover blur-lg opacity-90 backdrop-blur-2xl scale-110"
      />
      <MediaRenderer
        src={image}
        alt={`${product.name} view ${galleryIndex + 1}`}
        width={150}
        height={150}
        className="relative z-10 w-full h-full object-contain"
      />
      {options?.showMoreOverlay && remainingCount > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35">
          <span className="text-2xl font-semibold text-white">
            +{remainingCount}
          </span> 
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 3xl:space-y-5">
      {/* Mobile: Horizontal scrollable images */}
      <div className="block lg:hidden">
        <div className="relative">
          {/* Favorite Button - Mobile Only */}
          <FavoriteButton
            product={product}
            productData={productData}
            variant="mobile"
          />
          
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl"
            style={{ scrollbarWidth: "none" }}
          >
            {mobileImages.map((image, idx) => (
              <div
                key={idx}
                className="min-w-full max-w-96 max-h-96 snap-start aspect-square overflow-hidden"
              >
                {/* static image change behaviour: first image reflects selected preference */}
                <MediaRenderer
                  src={image}
                  alt={`${product.name} view ${idx + 1}`}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover md:object-contain"
                />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {mobileImages.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to image ${idx + 1}`}
                onClick={() => scrollToIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${activeIndex === idx ? "bg-white" : "bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Current behaviour unchanged */}
      <div className="hidden lg:block">
        <ReadMoreDialog
          title={product.name}
          trigger={
            <div className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
              {/* static image change behaviour of selected Ready? Choose your preference */}
              <MediaRenderer
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          }
          modelImages={mobileImages}
        />
      </div>

      {/* Image Gallery Thumbnails - desktop only (max 2) */}
      {galleryImages.length > 0 && (
        <div className="hidden lg:grid grid-cols-2 gap-3 3xl:gap-4">
          {firstThumb && (
            <ReadMoreDialog
              key="thumb-1"
              title={product.name}
              trigger={renderThumbnail(firstThumb, 0)}
              modelImages={mobileImages}
              initialIndex={1}
            />
          )}
          {secondThumb && (
            <ReadMoreDialog
              key="thumb-2"
              title={product.name}
              trigger={renderThumbnail(secondThumb, 1, {
                showMoreOverlay: true,
              })}
              modelImages={mobileImages}
              initialIndex={2}
            />
          )}
        </div>
      )}
    </div>
  );
}
