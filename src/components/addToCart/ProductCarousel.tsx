"use client";
import React, { useRef } from "react";
import { PlusIcon } from "../icons";
import { ProductSuggestion } from "../types";
import FallbackImage from "../ui/fallbackImage";
import { isRemoteImageUrl } from "@/lib/utils";

interface ProductCarouselProps {
  products: ProductSuggestion[];
  onAddProduct?: (productId: string) => void;
}

export default function ProductCarousel({
  products,
  onAddProduct,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleAddClick = (e: React.MouseEvent, productId: string) => {
    if (hasDragged.current) {
      e.preventDefault();
      return;
    }
    onAddProduct?.(productId);
  };

  return (
    <div className="mt-5">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="flex overflow-x-auto gap-3 px-5 py-1 pb-2 scroll-px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none cursor-grab select-none"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-20 rounded-lg border border-neutral-sand-100 p-1"
          >
            <div className="h-20 w-full overflow-hidden rounded-lg bg-neutral-sand-100 relative">
              <FallbackImage
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized={isRemoteImageUrl(product.image)}
              />
            </div>
            <div className="relative z-10 -mt-3 flex justify-center">
              <button
                onClick={(e) => handleAddClick(e, product.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-sand-100 bg-white transition-colors hover:bg-neutral-sand-100 cursor-pointer"
                aria-label={`Add ${product.title}`}
              >
                <PlusIcon />
              </button>
            </div>
            <div className="mt-2 min-w-0 px-0.5 text-center">
              <div className="truncate text-xs font-medium text-gray-900">
                {product.title}
              </div>
              {product.description && (
                <div className="mb-1 truncate text-[9px] font-medium text-charcol-color">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
