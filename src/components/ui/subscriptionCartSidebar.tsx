"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSubscriptionSidebar } from "@/lib/subscriptionSidebar";
import { Trash2 } from "lucide-react";
import { Button } from "./button";
import Spinner from "./spinner";
import FallbackImage from "./fallbackImage";
import {
  getCurrencySymbol,
  isRemoteImageUrl,
  resolveCartVariantType,
  resolveProductImageUrl,
} from "@/lib/utils";
import {
  useUpdateSubscriptionProductsMutation,
  useRemoveSubscriptionProductMutation,
  useConfirmSubscriptionUpdateMutation,
} from "@/store/api/subscriptionApi";
import {
  useGetCartBySubscriptionIdQuery,
  useValidateCouponMutation,
  useRemoveCouponMutation,
} from "@/store/api/cartApi";
import { useParams } from "next/navigation";
import Backdrop from "./backdrop";
import CartHeader from "../addToCart/CartHeader";
import ProductCarousel from "../addToCart/ProductCarousel";
import Loading from "./loading";
import type { ProductSuggestion } from "../types";
import { toast } from "react-hot-toast";
import InputField from "./input";
import { useLocale, useTranslations } from "next-intl";

function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <div className="flex gap-4">
        <div className="w-24 h-24 shrink-0 rounded-lg bg-gray-200 animate-pulse" />
        <div className="flex-1 py-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="h-5 w-2/3 max-w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-5 shrink-0 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-2 h-4 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestedCarouselSkeleton() {
  return (
    <div className="mt-2">
      <div className="mb-3 px-5">
        <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-3 overflow-hidden px-5 pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-20 shrink-0 rounded-lg border border-neutral-sand-100 p-1"
          >
            <div className="h-20 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="relative z-10 -mt-3 flex justify-center">
              <div className="h-5 w-5 rounded-full border border-neutral-sand-100 bg-white">
                <div className="h-full w-full rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 space-y-1 px-0.5">
              <div className="mx-auto h-3 w-14 rounded bg-gray-200 animate-pulse" />
              <div className="mx-auto h-2.5 w-10 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentDetailsSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      <div className="h-6 w-36 rounded bg-gray-200 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-12 flex-1 rounded-lg bg-gray-200 animate-pulse" />
        <div className="h-12 w-24 rounded-lg bg-gray-200 animate-pulse" />
      </div>
      <div className="space-y-3 rounded-xl bg-neutral-sand-100 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex justify-between">
            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-14 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
        <hr className="border-gray-200" />
        <div className="flex justify-between">
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className="flex items-center justify-between gap-8 p-4">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="h-12 flex-1 rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
}

interface SubscriptionCartSidebarProps {
  subscriptionId?: string;
  cartId?: string;
}

export default function SubscriptionCartSidebar({
  subscriptionId: propSubscriptionId,
  cartId: propCartId,
}: SubscriptionCartSidebarProps) {
  const {
    isOpen,
    closeSidebar,
    cartId: contextCartId,
  } = useSubscriptionSidebar();
  const params = useParams();
  const subscriptionId = propSubscriptionId || (params?.id as string);
  const cartId = propCartId || contextCartId;
  const t = useTranslations("Cart");
  const locale = useLocale();

  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    refetch: refetchSubscriptionCart,
  } = useGetCartBySubscriptionIdQuery(subscriptionId!, {
    skip: !isOpen || !subscriptionId,
    refetchOnMountOrArgChange: true,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const [updateSubscriptionProducts, { isLoading: isUpdating }] =
    useUpdateSubscriptionProductsMutation();

  const [removeSubscriptionProduct, { isLoading: isRemoving }] =
    useRemoveSubscriptionProductMutation();

  const [confirmSubscriptionUpdate, { isLoading: isConfirming }] =
    useConfirmSubscriptionUpdateMutation();

  const [validateCoupon, { isLoading: isApplyingCoupon }] =
    useValidateCouponMutation();

  const [removeCoupon, { isLoading: isRemovingCoupon }] =
    useRemoveCouponMutation();

  const [couponCode, setCouponCode] = useState<string>("");
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);

  // Get planDurationDays from first cart item
  const planDurationDays = cartData?.data?.cart?.items?.[0]?.planDays;

  const products = cartData?.data?.cart?.items ?? [];

  const cartProductIds = useMemo(() => {
    const ids = new Set<string>();
    products.forEach((item: any) => {
      const id = item.productId || item.product?._id;
      if (id) ids.add(String(id));
    });
    return ids;
  }, [products]);

  const suggestedProducts = useMemo<ProductSuggestion[]>(() => {
    const apiSuggestions = cartData?.data?.suggestedProducts ?? [];

    return apiSuggestions
      .filter((product) => {
        const id = product?._id ? String(product._id) : "";
        if (!id || !product.title?.trim()) return false;
        if (cartProductIds.has(id)) return false;
        if (product.isInCart === true) return false;
        return true;
      })
      .map((product) => {
        const variantType = resolveCartVariantType(product);
        return {
          id: product._id,
          title: product.title,
          description: product.shortDescription ?? "",
          image: resolveProductImageUrl(product),
          variantType,
          planDays:
            variantType === "STAND_UP_POUCH"
              ? product.standupPouchPrice?.count_0?.capsuleCount ?? 60
              : planDurationDays ||
                product.sachetPrices?.thirtyDays?.durationDays,
        };
      });
  }, [
    cartData?.data?.suggestedProducts,
    cartProductIds,
    planDurationDays,
  ]);

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      await removeSubscriptionProduct({
        subscriptionId,
        productId,
      }).unwrap();
      toast.success(t("productRemovedFromSubscription"));
    } catch (error) {
      toast.error(t("failedToRemoveProduct"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSuggestedProduct = async (productId: string) => {
    if (!subscriptionId || addingProductId || isUpdating) return;

    const currentIds = products
      .map((item: any) => item.productId || item.product?._id)
      .filter((id: unknown): id is string => Boolean(id));

    if (currentIds.includes(productId)) return;

    setAddingProductId(productId);
    try {
      await updateSubscriptionProducts({
        subscriptionId,
        productIds: [...currentIds, productId],
      }).unwrap();
      toast.success(t("productAddedToSubscription"));
    } catch (error) {
      toast.error(t("failedToAddProduct"));
    } finally {
      setAddingProductId(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !cartId || !planDurationDays) {
      toast.error(t("enterCouponCodeCartIdPlanDuration"));
      return;
    }
    try {
      await validateCoupon({
        cartId,
        couponCode,
        planDurationDays,
        language: locale || "en",
      }).unwrap();
      toast.success(t("couponAppliedSuccessfully"));
      setIsCouponApplied(true);
    } catch (error) {
      toast.error(t("failedToApplyCoupon"));
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon({ 
        cartId: cartId!, 
        couponCode, 
        planDurationDays: planDurationDays!, 
        language: locale || "en" 
      }).unwrap();
      toast.success(t("couponRemovedSuccessfully"));
      setCouponCode("");
      setIsCouponApplied(false);
    } catch (error) {
      toast.error(t("failedToRemoveCoupon"));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmSubscriptionUpdate({
        subscriptionId,
        cartId: cartId!,
      }).unwrap();
      toast.success(t("subscriptionUpdatedSuccessfully"));
      closeSidebar();
    } catch (error) {
      toast.error(t("failedToConfirmSubscriptionUpdate"));
    }
  };

  const hasCartData = Boolean(cartData?.data?.cart);
  const showInitialSkeleton = (isCartLoading || isCartFetching) && !hasCartData;
  const showRefetchOverlay = isCartFetching && hasCartData;

  // Use cart API data for calculations when available
  const cart = cartData?.data?.cart;
  
  // Helper function to extract numeric value from Price object or number
  const getAmount = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value?.amount) return value.amount;
    return 0;
  };
  
  const subtotal = getAmount((cart as any)?.totalAmount) || getAmount(cart?.subtotal) || products.reduce(
    (acc: number, item: any) => acc + (item.totalAmount || 0),
    0
  );
  const totalDiscount = getAmount(cart?.discount) || products.reduce(
    (acc: number, item: any) =>
      acc +
      ((item.price?.amount || 0) -
        (item.price?.discountedPrice || item.price?.amount || 0)),
    0
  );
  const total = getAmount((cart as any)?.totalAmount) || getAmount(cart?.total) || products.reduce(
    (acc: number, item: any) => acc + (item.totalAmount || 0),
    0
  );
  const shipping = getAmount(cart?.shipping);
  const tax = getAmount(cart?.tax) || products.reduce(
    (acc: number, item: any) => acc + (item.price?.taxRate || 0),
    0
  );
  // Handle coupon discount from cart API (may not be in Cart interface)
  const couponDiscountAmount = getAmount((cart as any)?.couponDiscountAmount) || 0;
  
  // Use cart API currency first, fallback to product currency or USD
  const currency = (cart as any)?.currency || 
    cartData?.data?.cart?.items?.[0]?.price?.currency ||
    products[0]?.product?.price?.currency ||
    "USD";
  const symbol = getCurrencySymbol(currency);

  // Update coupon state when cart data changes
  useEffect(() => {
    if (cart?.couponCode) {
      setCouponCode(cart.couponCode);
      setIsCouponApplied(true);
    } else {
      setCouponCode("");
      setIsCouponApplied(false);
    }
  }, [cart?.couponCode]);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fresh cart (+ suggested products) whenever My Basket opens after an update.
  useEffect(() => {
    if (isOpen && subscriptionId) {
      void refetchSubscriptionCart();
    }
  }, [isOpen, subscriptionId, refetchSubscriptionCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <Backdrop isOpen onClose={closeSidebar} zIndex={-1} />

      {/* Sidebar Content */}
      <div className="relative w-full max-w-[450px] bg-off-white-color h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-700">
        <CartHeader />

        {/* Main Content — same order as normal cart: suggestions first, then items */}
        <div
          className={`relative flex-1 min-h-0 py-4 gray-scrollbar ${
            showRefetchOverlay ? "overflow-y-hidden" : "overflow-y-auto"
          }`}
        >
          {showRefetchOverlay ? <Loading /> : null}

          {showInitialSkeleton ? (
            <>
              <SuggestedCarouselSkeleton />
              <div className="space-y-3 px-4 pt-4">
                <div className="mb-2 h-6 w-32 rounded bg-gray-200 animate-pulse" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <CartItemSkeleton key={index} />
                ))}
              </div>
              <PaymentDetailsSkeleton />
            </>
          ) : (
            <>
              {suggestedProducts.length > 0 ? (
                <div
                  className={
                    addingProductId || isUpdating
                      ? "opacity-60 pointer-events-none"
                      : ""
                  }
                >
                  <h3 className="px-5 text-lg font-bold">
                    {t("suggestedProducts")}
                  </h3>
                  <ProductCarousel
                    products={suggestedProducts}
                    onAddProduct={handleAddSuggestedProduct}
                  />
                </div>
              ) : null}

              <div className="space-y-3 px-4 pt-4">
                <h3 className="text-lg font-bold mb-2">{t("cartSummary")}</h3>
                {products.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    {t("subscriptionEmpty")}
                  </div>
                ) : (
                  products.map((item: any) => {
                    const imageSrc = resolveProductImageUrl(item.product);
                    const displayPrice =
                      item.price?.discountedPrice ?? item.price?.amount ?? 0;
                    const listPrice = item.price?.amount ?? 0;
                    return (
                      <div
                        key={item.productId}
                        className="bg-white rounded-xl p-3 border border-gray-100 relative group"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 bg-[#F3F3F3] rounded-lg overflow-hidden shrink-0">
                            <FallbackImage
                              src={imageSrc}
                              alt={item.product?.title || t("product")}
                              fill
                              className="object-cover"
                              unoptimized={isRemoteImageUrl(imageSrc)}
                            />
                          </div>
                          <div className="flex-1 py-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-lg leading-tight break-words">
                                {item.product?.title}
                              </h4>
                              <button
                                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                                onClick={() => handleDelete(item.productId)}
                                disabled={deletingId === item.productId}
                              >
                                {deletingId === item.productId ? (
                                  <Spinner size="xs" color="gray" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                              {item.quantity} {t("items")}
                            </p>
                            <div className="mt-3 flex items-baseline gap-2">
                              <span className="text-xl font-bold">
                                {symbol}
                                {Number(displayPrice).toFixed(2)}
                              </span>
                              {listPrice > displayPrice ? (
                                <span className="text-gray-400 line-through text-sm">
                                  {symbol}
                                  {Number(listPrice).toFixed(2)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-4 px-4 pt-4">
                <h3 className="text-lg font-bold mb-2">{t("paymentDetails")}</h3>

                <div className="flex gap-2 items-stretch">
                  <InputField
                    floating={false}
                    name="couponCode"
                    type="text"
                    placeholder={t("enterDiscountCode")}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-1 ${
                      isCouponApplied ? "opacity-70 cursor-not-allowed" : ""
                    } py-3`}
                    disabled={isCouponApplied}
                  />
                  <div>
                    {isCouponApplied ? (
                      <Button
                        onClick={handleRemoveCoupon}
                        disabled={isRemovingCoupon}
                        className="h-full! px-7.5 text-base"
                      >
                        {isRemovingCoupon ? (
                          <Spinner size="xs" color="white" />
                        ) : (
                          t("remove")
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isApplyingCoupon}
                        className="h-full! px-7.5 text-base"
                      >
                        {isApplyingCoupon ? (
                          <Spinner size="xs" color="white" />
                        ) : (
                          t("apply")
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-sand-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span className="text-gray-900">
                      {symbol}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>{t("tax")}</span>
                      <span className="text-gray-900">
                        {symbol}
                        {tax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {shipping > 0 && (
                    <div className="flex justify-between">
                      <span>{t("shipping")}</span>
                      <span className="text-gray-900">
                        {symbol}
                        {shipping.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("discount")}</span>
                      <span className="text-gray-900">
                        -{symbol}
                        {totalDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("couponDiscount")}</span>
                      <span className="text-gray-900">
                        -{symbol}
                        {couponDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>{t("grandTotal")}</span>
                    <span className="text-gray-900">
                      {symbol}
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t space-y-6">
          {showInitialSkeleton ? (
            <FooterSkeleton />
          ) : (
            <div className="flex items-center justify-between gap-8 p-4">
              <div>
                <div className="text-2xl font-semibold break-all">
                  {symbol}
                  {total.toFixed(2)}
                </div>
                <div className="text-sm">{t("incAllTaxes")}</div>
                {cart?.couponCode && (
                  <div className="text-xs text-green-600 font-medium">
                    {t("couponLabel")}: {cart.couponCode}
                  </div>
                )}
              </div>
              <Button
                animateText={!isConfirming}
                onClick={handleConfirm}
                variant="elevate"
                size="elevate"
                className="flex-1"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <Spinner size="xs" color="white" />
                ) : (
                  t("confirm")
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
