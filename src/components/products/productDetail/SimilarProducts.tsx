"use client";
import { useRef, useState } from "react";
import { useAddCartItemMutation } from "@/store";
import { useCartSidebar } from "@/lib/cartSidebar";
import { toast } from "react-hot-toast";
import {
  hasAuthToken,
  getCurrencySymbol,
  isRemoteImageUrl,
  resolveLocalizedValue,
  resolveProductCurrency,
} from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/ui/fallbackImage";
import type { SimilarProduct } from "@/store/api/types/product.types";

interface SimilarProductsProps {
  similarProducts: SimilarProduct[];
  selectedPreference: "sachets" | "pouch";
}

const MOBILE_CARD_GAP = 16;

export default function SimilarProducts({
  similarProducts,
  selectedPreference,
}: SimilarProductsProps) {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { openCart } = useCartSidebar();
  const [addCartItem] = useAddCartItemMutation();
  const locale = useLocale();
  const tCommon = useTranslations("Common");
  const t = useTranslations("Products");
  const tCheckout = useTranslations("Checkout");

  const handleAddToCart = async (
    productId: string,
    hasStandupPouch: boolean,
  ) => {
    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }
    try {
      setAddingToCart(productId);
      const variantType =
        selectedPreference === "pouch" && hasStandupPouch
          ? "STAND_UP_POUCH"
          : "SACHETS";
      const res = await addCartItem({
        productId: productId,
        variantType: variantType,
      }).unwrap();
      openCart();
      toast.success(res?.message || tCheckout("addedToCartSuccessfully"));
    } catch (error: unknown) {
      console.error("Failed to add item to cart:", error);
      const err = error as { data?: { message?: string }; message?: string };
      const message =
        err?.data?.message || err?.message || t("failedToAddToCart");
      toast.error(message);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) {
      setActiveIndex(0);
      return;
    }

    if (el.scrollLeft >= maxScrollLeft - 8) {
      setActiveIndex(similarProducts.length - 1);
      return;
    }

    const scrollStep = el.clientWidth + MOBILE_CARD_GAP;
    const index = Math.round(el.scrollLeft / scrollStep);
    setActiveIndex(Math.max(0, Math.min(index, similarProducts.length - 1)));
  };

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const scrollStep = el.clientWidth + MOBILE_CARD_GAP;
    const targetLeft =
      index === similarProducts.length - 1
        ? maxScrollLeft
        : index * scrollStep;

    el.scrollTo({ left: targetLeft, behavior: "smooth" });
    setActiveIndex(index);
  };

  const renderProductCard = (
    product: SimilarProduct,
    className = "",
    isMobileSlide = false,
  ) => {
    const productTitle = resolveLocalizedValue(product.title, locale);
    const description =
      resolveLocalizedValue(product.shortDescription, locale) ||
      "A good source of protein, ideal for an active lifestyle";

    const priceObj = product?.sachetPrices?.thirtyDays;
    const currencySymbol = getCurrencySymbol(
      resolveProductCurrency(product, priceObj),
    );
    const discountedPrice =
      priceObj?.discountedPrice ?? product?.price?.amount ?? 0;
    const originalAmount = priceObj?.amount;

    return (
      <div
        className={`flex items-center gap-3 sm:gap-4 py-3 3xl:py-3.5 px-3 sm:px-3.75 3xl:px-4 bg-neutral-sand-100 rounded-xl ${className}`}
      >
        <div className="relative w-16 sm:w-20 3xl:w-25 h-16 sm:h-20 3xl:h-25 bg-white rounded-md overflow-hidden shrink-0">
          <FallbackImage
            src={product.productImage}
            alt={productTitle}
            fill
            className="object-cover"
            unoptimized={isRemoteImageUrl(product.productImage)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-charcol-color font-medium text-base sm:text-lg 3xl:text-[19px] truncate">
            {productTitle}
          </h4>
          <p className="text-charcol-color text-sm sm:text-base leading-snug mt-1 line-clamp-2 3xl:text-[17px]">
            {description}
          </p>
          <div
            className={`mt-2 3xl:mt-2.75 ${
              isMobileSlide
                ? "flex items-center justify-between gap-2"
                : "sm:flex items-center justify-between mt-1"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-charcol-color font-semibold text-sm 3xl:text-[19px] whitespace-nowrap">
                {currencySymbol}
                {discountedPrice.toFixed(2)}
              </span>
              {originalAmount != null && originalAmount > discountedPrice && (
                <span className="text-gray-warm text-xs sm:text-sm line-through 3xl:text-[19px] whitespace-nowrap">
                  {currencySymbol}
                  {originalAmount.toFixed(2)}
                </span>
              )}
            </div>
            <Button
              animateText
              onClick={() =>
                handleAddToCart(product._id, product?.hasStandupPouch ?? false)
              }
              disabled={addingToCart === product._id}
              className={`shrink-0 !bg-transparent border border-charcol-color cursor-pointer rounded-full text-sm font-medium text-charcol-color hover:scale-105 hover:transition-all transition-colors disabled:opacity-50 disabled:cursor-not-allowed 3xl:text-lg ${
                isMobileSlide
                  ? "w-auto px-5 min-h-9 h-9"
                  : "w-full sm:w-auto mt-1 sm:mt-0 px-8 3xl:px-9.5 3xl:pt-0 3xl:min-h-10 truncate"
              }`}
            >
              {addingToCart === product._id ? t("adding") : t("add")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const showScrollHint = similarProducts.length > 1;

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-charcol-color font-medium text-base 3xl:text-xl">
          {t("similarProducts")}
        </h3>
        {showScrollHint && (
          <p className="md:hidden text-xs text-gray-warm whitespace-nowrap">
            Swipe →
          </p>
        )}
      </div>

      {similarProducts.length > 0 && (
        <>
          <div className="md:hidden relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label={t("similarProducts")}
            >
              {similarProducts.map((product) => (
                <div
                  key={product._id}
                  className="w-full shrink-0 snap-center"
                >
                  {renderProductCard(product, "w-full", true)}
                </div>
              ))}
            </div>

            {showScrollHint && activeIndex < similarProducts.length - 1 && (
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-[#F7F6F0] via-[#F7F6F0]/80 to-transparent"
                aria-hidden
              />
            )}

            {showScrollHint && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {similarProducts.map((product, index) => (
                  <button
                    key={product._id}
                    type="button"
                    aria-label={`Go to similar product ${index + 1}`}
                    onClick={() => scrollToIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      activeIndex === index
                        ? "w-5 bg-charcol-color"
                        : "w-1.5 bg-charcol-color/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block space-y-2">
            {similarProducts.map((product) => (
              <div key={product._id}>{renderProductCard(product)}</div>
            ))}
          </div>
        </>
      )}

      {similarProducts.length === 0 && (
        <p className="text-gray-warm text-sm">{t("noSimilarProducts")}</p>
      )}
    </div>
  );
}
