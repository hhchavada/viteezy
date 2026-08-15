"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAddCartItemMutation } from "@/store";
import {
  Discount,
  Heart,
  HeartIcon,
  HeartIconFilled,
  Minus,
  Plus,
  Sachets,
  Standup,
  WhiteStarIcon,
  YesIcon,
} from "../../icons";
import { useCartSidebar } from "@/lib/cartSidebar";
import { Product } from "@/components/types";
import { useClickOutside } from "@/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { toast } from "react-hot-toast";
import FixedPortal from "@/components/ui/fixedPortal";
import {
  cn,
  getCurrencySymbol,
  getProductVariantAvailability,
  hasAuthToken,
  resolveLocalizedValue,
  resolveProductCurrency,
  resolveSachetPriceForPlanDays,
} from "@/lib/utils";
import { useGetUserMeQuery, useGetTransactionsBySubscriptionQuery, useUpdateUserLanguageMutation, useUpdateUserProfileMutation } from "@/store/api/userApi";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";

interface ProductInfoProps {
  product: Product;
  productData?: any;
  selectedPreference: "sachets" | "pouch";
  setSelectedPreference: (preference: "sachets" | "pouch") => void;
  mode?: "default" | "modal";
  /** When set, force sachet price for this subscription plan length. */
  planDays?: number;
}

export default function ProductInfo({
  product,
  productData,
  selectedPreference,
  setSelectedPreference,
  mode = "default",
  planDays,
}: ProductInfoProps) {
  const { openCart } = useCartSidebar();
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("Common");
  const t = useTranslations("Products");
  const tCheckout = useTranslations("Checkout");
  const [addCartItem, { isLoading: isMutatingCart }] = useAddCartItemMutation();
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [hideMembershipPromo, setHideMembershipPromo] = useState(false);
  const [selectedCapsuleCount, setSelectedCapsuleCount] = useState<number>(60);
  const [quantity, setQuantity] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() =>
    setIsDropdownOpen(false),
  );
  const mobileActionsRef = useRef<HTMLDivElement>(null);
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile || mode === "modal") {
      setShowStickyMobileCta(false);
      return;
    }

    const target = mobileActionsRef.current;
    if (!target) return;

    const updateStickyVisibility = () => {
      const rect = target.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight && rect.bottom > 0;
      setShowStickyMobileCta(!isVisible);
    };

    updateStickyVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMobileCta(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8px 0px" },
    );

    observer.observe(target);
    window.addEventListener("scroll", updateStickyVisibility, { passive: true });
    window.addEventListener("resize", updateStickyVisibility);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateStickyVisibility);
      window.removeEventListener("resize", updateStickyVisibility);
    };
  }, [
    isMobile,
    mode,
    selectedPreference,
    hideMembershipPromo,
    selectedCapsuleCount,
  ]);

  // GET /users/me - skip when not logged in; hide Membership in product when user is member or sub-member
  const { data: userMeData } = useGetUserMeQuery(undefined, {
    skip: !hasAuthToken(),
  });
  const user = userMeData?.data?.user;

  useEffect(() => {
    setHideMembershipPromo(
      Boolean(user && (user.isMember === true || user.isSubMember === true)),
    );
  }, [user]);

  // Get available capsule counts dynamically from standupPouchPrice (memoized)
  const getAvailableCapsuleCounts = useCallback((): number[] => {
    if (!productData?.standupPouchPrice) return [];
    const counts: number[] = [];
    Object.values(productData.standupPouchPrice).forEach((priceObj: any) => {
      if (priceObj?.capsuleCount && typeof priceObj.capsuleCount === "number") {
        counts.push(priceObj.capsuleCount);
      }
    });
    return counts.sort((a, b) => a - b); // Sort ascending
  }, [productData?.standupPouchPrice]);

  // Find price object by capsuleCount value (memoized)
  const getPriceObjByCapsuleCount = useCallback(
    (capsuleCount: number) => {
      if (!productData?.standupPouchPrice) return null;
      const priceEntries = Object.entries(productData.standupPouchPrice);
      for (const [key, priceObj] of priceEntries) {
        if ((priceObj as any)?.capsuleCount === capsuleCount) {
          return priceObj;
        }
      }
      return null;
    },
    [productData?.standupPouchPrice],
  );

  const variantAvailability = useMemo(
    () => getProductVariantAvailability(productData),
    [productData],
  );
  const { hasSachets, hasStandUpPouch, showPreferenceSelector } =
    variantAvailability;

  useEffect(() => {
    setQuantity(1);
    // Initialize selectedCapsuleCount with first available option when switching to pouch
    if (
      selectedPreference === "pouch" &&
      productData?.standupPouchPrice &&
      hasStandUpPouch
    ) {
      const availableCounts = getAvailableCapsuleCounts();
      if (availableCounts.length > 0) {
        setSelectedCapsuleCount(availableCounts[0]);
      }
    }
  }, [
    selectedPreference,
    productData?.standupPouchPrice,
    hasStandUpPouch,
    getAvailableCapsuleCounts,
  ]);

  // Get is_liked from productData, default to false
  const isLiked = productData?.is_liked ?? false;
  const productId = product?.id || productData?._id;

  const handleAddToCart = async () => {
    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }
    try {
      setAddingToCart(true);
      const variantType =
        selectedPreference === "pouch" && hasStandUpPouch
          ? "STAND_UP_POUCH"
          : "SACHETS";

      // Build payload based on variant type
      const payload: any = {
        productId: productData?._id || product.id,
        variantType: variantType,
      };

      if (variantType === "STAND_UP_POUCH") {
        payload.quantity = quantity;
        payload.isOneTime = true;
        payload.planDays = selectedCapsuleCount; // API expects planDays, value from capsuleCount
      }

      const res = await addCartItem(payload).unwrap();
      openCart();
      toast.success(res?.message || tCheckout("addedToCartSuccessfully"));
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      const message =
        error?.data?.message || error?.message || t("failedToAddToCart");
      toast.error(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }
    try {
      setBuyingNow(true);
      const variantType =
        selectedPreference === "pouch" && hasStandUpPouch
          ? "STAND_UP_POUCH"
          : "SACHETS";

      // Build payload based on variant type
      const payload: any = {
        productId: productData?._id || product.id,
        variantType: variantType,
      };

      if (variantType === "STAND_UP_POUCH") {
        payload.quantity = quantity;
        payload.isOneTime = true;
        payload.planDays = selectedCapsuleCount; // API expects planDays, value from capsuleCount
      }

      const res = await addCartItem(payload).unwrap();
      // Redirect to checkout page
      toast.success(
        res?.message
          ? `${res.message} ${tCheckout("redirectingToCheckoutOnly")}`
          : tCheckout("addedToCartRedirecting"),
      );
      window.location.href = "/checkout";
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      const message =
        error?.data?.message || error?.message || t("failedToAddToCart");
      toast.error(message);
    } finally {
      setBuyingNow(false);
    }
  };


  // Get selected price object based on preference
  const getSelectedPriceObj = () => {
    if (selectedPreference === "pouch" && hasStandUpPouch && !planDays) {
      // Get price object for the selected capsule count
      const priceObj = getPriceObjByCapsuleCount(selectedCapsuleCount);
      if (priceObj) {
        return priceObj;
      }
      // Fallback to count_0 if specific count not found
      if (productData?.standupPouchPrice?.count_0) {
        return productData.standupPouchPrice.count_0;
      }
      return null;
    } else {
      const sachetPrices = productData?.sachetPrices;

      // Subscription Change Order modal: match active plan days
      if (planDays) {
        const planTier = resolveSachetPriceForPlanDays(sachetPrices, planDays);
        if (planTier) return planTier;
      }

      // Default product page: thirtyDays → sixtyDays → ninetyDays
      if (sachetPrices?.thirtyDays) {
        return sachetPrices.thirtyDays;
      } else if (sachetPrices?.sixtyDays) {
        return sachetPrices.sixtyDays;
      } else if (sachetPrices?.ninetyDays) {
        return sachetPrices.ninetyDays;
      }
      return null;
    }
  };

  const selectedPriceObj: any = getSelectedPriceObj();

  const baseAmount =
    typeof selectedPriceObj?.amount === "number"
      ? selectedPriceObj.amount
      : typeof product.price === "number"
        ? product.price
        : 0;

  const discountedAmount =
    typeof selectedPriceObj?.discountedPrice === "number"
      ? selectedPriceObj.discountedPrice
      : baseAmount;

  // Multiply by quantity for final amount (only for capsule selection box)
  const finalBaseAmount = baseAmount * quantity;
  const finalDiscountedAmount = discountedAmount * quantity;

  const currencySymbol = getCurrencySymbol(
    resolveProductCurrency(productData, selectedPriceObj),
  );
  const showDiscount = baseAmount > discountedAmount;
  const discountPercent =
    showDiscount && typeof selectedPriceObj?.discountedPrice === "number"
      ? selectedPriceObj.savingsPercentage
      : 0;

  const addToCartButton = (className?: string) => (
    <Button
      size="elevate"
      variant="elevate"
      animateText
      onClick={handleAddToCart}
      disabled={addingToCart}
      className={cn(
        "flex-1 bg-gray-900 text-white truncate min-h-12",
        className,
      )}
      style={{ willChange: "borderRadius, transform" }}
    >
      {addingToCart ? t("adding") : t("addToCart")}
    </Button>
  );

  const buyNowButton = (className?: string) => (
    <Button
      size="elevate"
      variant="elevate"
      animateText
      onClick={handleBuyNow}
      disabled={buyingNow}
      className={cn(
        "flex-1 bg-teal-green-color hover:bg-teal-green-color text-white min-h-12",
        className,
      )}
      style={{ willChange: "borderRadius, transform" }}
    >
      {buyingNow ? t("processing") : t("buyNow")}
    </Button>
  );

  return (
    <div className="space-y-4 md:space-y-6 3xl:space-y-6.5">
        {/* Product Title & Subtitle */}
        <div>
          <h1 className="text-3xl md:text-4xl font-medium mb-2 3xl:text-[39px]">
            {product.name}
          </h1>
          <p className="sub-heading-style text-base text-charcol-color 3xl:text-[19px]">
            {resolveLocalizedValue(productData?.shortDescription, locale) ||
              t("shortDescriptionFallback")}
          </p>

          {/* Rating */}
          {/* <div className="flex items-center gap-2 3xl:gap-3 mt-5.25">
            <div className="flex gap-0.5 items-center">
              {[1, 2, 3, 4, 5].map((star) => {
                const fillPercentage = Math.max(
                  0,
                  Math.min(100, (product.rating - (star - 1)) * 100),
                );
                const isFilled = star <= Math.floor(product.rating);
                const isPartial =
                  star === Math.floor(product.rating) + 1 &&
                  product.rating % 1 > 0;

                return (
                  <div
                    key={star}
                    className="relative text-sm font-semibold px-0.5 3xl:px-1 py-0.5 3xl:py-[4.5px] bg-gray-300 text-gray-400"
                  >
                    {(isFilled || isPartial) && (
                      <div
                        className="absolute inset-0 bg-teal-green-color overflow-hidden"
                        style={{
                          width: isFilled
                            ? "100%"
                            : `${(product.rating % 1) * 100}%`,
                        }}
                      />
                    )}
                    <div
                      className={`relative z-10 ${
                        isFilled || isPartial ? "text-white" : "text-gray-400"
                      }`}
                    >
                      <WhiteStarIcon />
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="text-sm font-medium 3xl:text-lg">
              {product.rating.toFixed(1)} {t("rating")}
            </span>
          </div> */}
        </div>

        {/* Price */}
        <div>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-semibold 3xl:text-[32px]">
              {currencySymbol}
              {discountedAmount.toFixed(2)}
            </p>
            {showDiscount && (
              <>
                <p className="text-xl text-light-slate-color line-through 3xl:text-2xl font-medium">
                  {currencySymbol}
                  {baseAmount.toFixed(2)}
                </p>
                {discountPercent > 0 && (
                  <span className="text-sm font-semibold text-white 3xl:text-base bg-soft-orange px-2 pt-0.75 3xl:pt-[1.5px] pb-0.75 3xl:pb-0 rounded-[5px]">
                    {discountPercent}%{" "}
                    <span className="uppercase">{t("off")}</span>
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-charcol-color text-sm 3xl:text-lg">
            {t("mrpInclusive")}
          </p>
        </div>

        {/* Benefits List - dynamic from API */}
        {Array.isArray(productData?.benefits) &&
          productData.benefits.length > 0 && (
            <div className="space-y-2.75">
              {productData.benefits.map((benefit: unknown, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-4.5 3xl:w-5 h-4.5 3xl:h-5 rounded-full bg-dark-teal-green-color flex items-center justify-center shrink-0 mt-px 3xl:mt-1">
                    <YesIcon />
                  </div>
                  <p className="text-charcol-color text-sm 3xl:text-lg">
                    {resolveLocalizedValue(benefit, locale)}
                  </p>
                </div>
              ))}
            </div>
          )}

        {/* Membership Banner */}
        {mode !== "modal" && !hideMembershipPromo && (
          <div className="bg-linear-to-r from-[#b8efe6] to-[#f8dacb] rounded-xl px-4 py-3.5 md:py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 shadow-sm">
            <div className="flex items-start md:items-center gap-2.5 w-full min-w-0">
              <Discount />
              <p className="text-charcol-color font-medium text-sm 3xl:text-base lg:max-w-lg leading-snug min-w-0">
                {t("membershipBanner")}
              </p>
            </div>
            <Button
              size="elevate-md"
              variant="elevate"
              animateText
              onClick={() => router.push("/membership")}
              className="bg-gray-900 text-white px-4 h-10! text-sm font-medium whitespace-nowrap 3xl:text-base w-full md:w-auto"
            >
              {t("membership")}
            </Button>
          </div>
        )}

        {/* Preference Selector */}
        {mode !== "modal" && showPreferenceSelector && (
          <div>
            <p className="text-charcol-color font-medium mb-3 3xl:text-xl">
              {t("choosePreference")}
            </p>
            <div
              className={cn(
                "grid gap-3",
                hasSachets && hasStandUpPouch ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {hasSachets && (
                <button
                  onClick={() => setSelectedPreference("sachets")}
                  className={`flex items-center cursor-pointer gap-3 p-3 px-4 rounded-lg hover:bg-neutral-sand-100/80 transition-colors min-h-12 ${
                    selectedPreference === "sachets"
                      ? "border border-charcol-color bg-neutral-sand-100"
                      : "border border-linen-color bg-transparent"
                  }`}
                >
                  <Sachets />
                  <span className="text-gray-900 font-medium text-sm text-nowrap 3xl:text-lg">
                    {t("viteezyPouchets")}
                  </span>
                </button>
              )}
              {hasStandUpPouch && (
                <button
                  onClick={() => setSelectedPreference("pouch")}
                  className={`flex items-center cursor-pointer gap-3 p-3 px-4 rounded-lg hover:bg-neutral-sand-100/80 transition-colors min-h-12 ${
                    selectedPreference === "pouch"
                      ? "border border-charcol-color bg-neutral-sand-100"
                      : "border border-linen-color bg-transparent"
                  }`}
                >
                  <Standup />
                  <span className="text-gray-900 font-medium text-sm text-nowrap 3xl:text-lg">
                    {t("standUpPouch")}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* open capsule count */}
        {selectedPreference === "pouch" && hasStandUpPouch && (
          <div className="border border-black rounded-lg bg-[#FDFBF7] p-4 mt-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium text-lg text-charcol-color">
                  {t("oneTimePurchase")}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {tCheckout("capsulesCount", { count: selectedCapsuleCount })}
                </p>
              </div>
              <span className="font-semibold text-lg mt-0.5">
                {currencySymbol}
                {finalDiscountedAmount.toFixed(2)}
              </span>
            </div>

            <p className="text-sm font-medium mb-2">{tCheckout("capsulesOptions")}</p>
            <div className="flex gap-3">
              <div className="relative flex-1" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full  border border-linen-color rounded-md px-3 py-2 text-sm focus:outline-none focus:border-charcol-color cursor-pointer h-10 flex items-center justify-between select-none"
                >
                  <span>{tCheckout("capsulesCount", { count: selectedCapsuleCount })}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-black rounded-md shadow-lg z-50 overflow-hidden">
                    {getAvailableCapsuleCounts().map((capsuleCount) => (
                      <div
                        key={capsuleCount}
                        onClick={() => {
                          setSelectedCapsuleCount(capsuleCount);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer flex items-center m-2 justify-between hover:bg-neutral-50 ${
                          selectedCapsuleCount === capsuleCount
                            ? "bg-[#FDFBF7]"
                            : ""
                        }`}
                      >
                        <span>{tCheckout("capsulesCount", { count: capsuleCount })}</span>
                        {selectedCapsuleCount === capsuleCount && (
                          <FaCheckCircle className="w-4 h-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center border border-linen-color rounded-md  h-10 w-fit shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-md transition-colors text-charcol-color border-r border-linen-color cursor-pointer"
                  type="button"
                >
                  <Minus />
                </button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-md transition-colors text-charcol-color border-l border-linen-color cursor-pointer"
                  type="button"
                >
                  <Plus />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {mode !== "modal" && (
          <>
            {/* Mobile in-flow CTA */}
            <div
              ref={mobileActionsRef}
              className="flex md:hidden flex-col gap-2 w-full"
            >
              {addToCartButton("w-full rounded-xl")}
              {buyNowButton("w-full rounded-xl")}
            </div>

            {/* Mobile sticky CTA — only when in-flow buttons scroll out of view */}
            <FixedPortal>
              <div
                aria-hidden={!showStickyMobileCta}
                className={cn(
                  "md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-linen-color bg-off-white-color/95 backdrop-blur shadow-[0_-10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out",
                  showStickyMobileCta
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "translate-y-full opacity-0 pointer-events-none",
                )}
              >
                <div className="mx-auto max-w-3xl px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                  <div className="flex items-center gap-3">
                    {addToCartButton("h-12 rounded-xl")}
                    {buyNowButton("h-12 rounded-xl")}
                  </div>
                </div>
              </div>
            </FixedPortal>

            {/* Desktop/tablet actions */}
            <div className="hidden md:flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <FavoriteButton
                product={product}
                productData={productData}
                isLiked={isLiked}
                showOnMobile={false}
              />
              {addToCartButton("w-full")}
              {buyNowButton("w-full min-h-11")}
            </div>
          </>
        )}
      </div>
  );
}
