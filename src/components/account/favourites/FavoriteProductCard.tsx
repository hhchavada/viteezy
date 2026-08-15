"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BlackStarIcon, Heart } from "@/components/icons";
import FallbackImage from "@/components/ui/fallbackImage";
import { FavoriteProduct } from "@/components/types/account";
import { Button } from "@/components/ui/button";
import { useAddCartItemMutation } from "@/store";
import { useCartSidebar } from "@/lib/cartSidebar";
import { useWishlist } from "@/hooks";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";

interface FavoriteProductCardProps {
  product: FavoriteProduct & { product?: any }; // Extended to include full product data
  onRemoveFavorite?: (id: string) => void;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  product,
  onRemoveFavorite,
}) => {
  const t = useTranslations("Header");
  const tAccount = useTranslations("Account");
  const [isFavorite, setIsFavorite] = useState(true);
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const { openCart } = useCartSidebar();
  const { isLiked, isLoading, toggleWishlist } = useWishlist(product.id, true, product.product?.is_liked ?? true);
  const router = useRouter();
  const currencySymbol = getCurrencySymbol(product.currency);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      try {
        await toggleWishlist();
        if (onRemoveFavorite && !isLiked) {
          onRemoveFavorite(product.id);
        }
      } catch (error) {
        console.error("Failed to toggle wishlist:", error);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addCartItem({
        productId: product.id,
        variantType: "SACHETS",
      }).unwrap();
      openCart();
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.id}`)
  };

  return (
    <div onClick={handleNavigate} className="product-card-group relative bg-offwhite-color p-1.5 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer">
      {/* Product Image Container */}
      <div className="relative w-full aspect-square  overflow-hidden rounded-lg ">
        <FallbackImage
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-100"
          unoptimized
        />

        <div className="absolute top-0 start-0 opacity-0 fav-alter-img h-full w-full transition-opacity duration-500 ease-in-out">
          <Image
            src={"/bannerImg1.png"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 w-full p-2 group fav-btn">
          <Button
            className="w-full truncate"
            variant="elevate"
            size="elevate"
            animateText
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? t("adding") : t("addToCart")}
          </Button>
        </div>

        {/* Favorite Icon */}
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading}
          aria-label={isLiked ? tAccount("removeFromFavorites") : tAccount("addToFavoritesAria")}
          className={`${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          } absolute top-4 right-4  rounded-full cursor-pointer`}
          // className={`${isLoading ? "opacity-50 cursor-not-allowed" : ""} absolute top-4 right-4 bg-white p-3 rounded-full cursor-pointer`}
        >
          <Heart
            className={`h-7 w-7 transition-colors ${
              isLiked ? "fill-black stroke-black" : "fill-none stroke-gray-400"
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {currencySymbol}
              {product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {currencySymbol}
                {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center">
            <div className="flex items-center gap-1 border-e border-black me-1 pe-1">
              <BlackStarIcon />
              <span className="text-sm font-medium text-gray-900">
                {product.rating}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {tAccount("reviewCount", { count: product.reviewCount })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteProductCard;
