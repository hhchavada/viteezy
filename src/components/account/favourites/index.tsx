"use client";

import React, { memo, useMemo, useState } from "react";
import AccountNav from "../components/AccountNav";
import FavoriteProductCard from "./FavoriteProductCard";
import { useGetWishlistQuery } from "@/store";
import { useGetUserMeQuery } from "@/store/api/userApi";
import { useTranslations } from "next-intl";
import { resolveProductCurrency } from "@/lib/utils";

const Favourites = () => {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get user data for userName
  const { data: userData } = useGetUserMeQuery();
  const userName = userData?.data?.user?.name || t("guestUserName");

  // Fetch wishlist data
  const { data, isLoading, error } = useGetWishlistQuery({ page, limit });

  const wishlistItems = data?.data || [];

  // Transform wishlist items to FavoriteProduct format
  const favorites = useMemo(
    () =>
      wishlistItems.map((item) => {
        const product = item.product;
        const price =
          product.originalPrice?.discountedPrice ??
          product.sachetPrices?.thirtyDays?.discountedPrice ??
          product.price?.discountedPrice ??
          product.price?.amount ??
          0;
        const originalPrice =
          product.originalPrice?.amount ??
          product.sachetPrices?.thirtyDays?.amount ??
          product.price?.amount ??
          price;
        const rating = product.averageRating || product.reviewStats?.averageRating || 0;
        const reviewCount = product.ratingCount || product.reviewStats?.totalReviews || 0;

        return {
          id: item.productId || product._id,
          name: product.title || "",
          description: product.shortDescription || product.description || "",
          price,
          originalPrice,
          currency: resolveProductCurrency(product),
          rating,
          reviewCount,
          image: product.productImage || "",
          product,
        };
      }),
    [wishlistItems]
  );

  const handleRemoveFavorite = (id: string) => {
    // The removal is handled by FavoriteProductCard using useWishlist hook
    // This function is kept for backward compatibility but is optional
  };

  if (isLoading) {
    return (
      <div>
        <AccountNav title={t("tabs.favorites")} />
        <div className="flex justify-center items-center py-16 mt-7">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AccountNav title={t("tabs.favorites")} />
        <div className="text-center py-16 bg-gray-50 rounded-lg mt-7">
          <p className="text-sm text-red-500">
            {t("favoritesLoadError")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AccountNav title={t("tabs.favorites")} />

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg mt-7">
          <p className="text-sm text-gray-400">
            {t("favoritesEmpty")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4.5 mt-7">
            {favorites.map((product) => (
              <FavoriteProductCard
                key={product.id}
                product={product}
                onRemoveFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
          {/* Load More Button - if pagination hasNext */}
          {data?.pagination?.hasNext && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
              >
                {tCommon("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(Favourites);
