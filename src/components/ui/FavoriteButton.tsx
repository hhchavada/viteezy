"use client";

import { useState } from "react";
import { HeartIcon, HeartIconFilled } from "@/components/icons";
import { useWishlist } from "@/hooks";
import { Product } from "@/components/types";
import FavoritePopup from "../products/productDetail/FavoritePopup";

interface FavoriteButtonProps {
  product: Product;
  productData?: any;
  isLiked?: boolean;
  className?: string;
  showOnMobile?: boolean;
  position?: "absolute" | "relative";
  variant?: "default" | "mobile";
}

export default function FavoriteButton({
  product,
  productData,
  isLiked: propIsLiked,
  className = "",
  showOnMobile = false,
  position = "relative",
  variant = "default",
}: FavoriteButtonProps) {
  const [isFavoritePopupOpen, setIsFavoritePopupOpen] = useState(false);
  
  // Use prop isLiked if provided, otherwise get from productData
  const isLiked = propIsLiked ?? productData?.is_liked ?? false;
  const productId = product?.id || productData?._id;

  // Use wishlist hook
  const {
    isLiked: wishlistLiked,
    isLoading: isWishlistLoading,
    toggleWishlist,
  } = useWishlist(productId, isLiked, isLiked);

  const handleAddToFavorite = async () => {
    if (toggleWishlist && productId) {
      try {
        const wasLiked = wishlistLiked;
        await toggleWishlist();
        if (!wasLiked) {
          setIsFavoritePopupOpen(true);
        }
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
      }
    }
  };

  // Mobile variant - positioned absolutely on image gallery
  if (variant === "mobile") {
    return (
      <>
        <FavoritePopup
          product={product}
          isOpen={isFavoritePopupOpen}
          onClose={() => setIsFavoritePopupOpen(false)}
        />
        <button
          onClick={handleAddToFavorite}
          disabled={isWishlistLoading}
          className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm border transition-all duration-200 hover:bg-white hover:scale-105 ${className}`}
          aria-label={
            wishlistLiked
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {wishlistLiked ? (
            <span className="w-6 h-6 text-red-500 flex items-center justify-center">
              <HeartIconFilled />
            </span>
          ) : (
            <span className="w-6 h-6 text-gray-700 flex items-center justify-center">
              <HeartIcon />
            </span>
          )}
        </button>
      </>
    );
  }

  // Default variant - for desktop product info section
  return (
    <>
      <FavoritePopup
        product={product}
        isOpen={isFavoritePopupOpen}
        onClose={() => setIsFavoritePopupOpen(false)}
      />
      <button
        onClick={handleAddToFavorite}
        disabled={isWishlistLoading}
        className={`w-12.5 h-12.5 rounded-full cursor-pointer ${showOnMobile ? "flex" : "hidden sm:flex"} items-center justify-center bg-white transition-all duration-100 ${className}`}
        aria-label={
          wishlistLiked
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        {wishlistLiked ? <HeartIconFilled /> : <HeartIcon />}
      </button>
    </>
  );
}
