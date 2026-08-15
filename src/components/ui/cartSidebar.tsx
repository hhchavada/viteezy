"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useCartSidebar } from "@/lib/cartSidebar";
import OfferProgress from "../addToCart/OfferProgressBar";
import CartHeader from "../addToCart/CartHeader";
import CartEmptyState from "../addToCart/CartEmptyState";
import ProductCarousel from "../addToCart/ProductCarousel";
import CartItemsList from "../addToCart/CartItemsList";
import CartFooter from "../addToCart/CartFooter";
import { CartItemData, ProductSuggestion } from "../types";
import {
  useLazyGetCartQuery,
  useRemoveCartItemMutation,
  useAddCartItemMutation,
  useRemoveCouponMutation,
} from "@/store/api/cartApi";
import type { GetCartResponse } from "@/store/api/types/cart.types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Loading from "./loading";
import { buildAddCartItemPayload, resolveCartVariantType, resolveProductImageUrl } from "@/lib/utils";

// Cart pricing state interface
interface CartPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  couponDiscountAmount?: number;
}

const defaultPricing: CartPricing = {
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  currency: "USD",
  couponDiscountAmount: 0,
};

function getCartItemPrice(item: {
  price?: { totalAmount?: number; amount?: number };
  totalAmount?: number;
  product?: {
    price?: { amount?: number };
    standupPouchPrice?: { count_0?: { amount?: number; discountedPrice?: number } };
  };
}): number {
  const fromPrice = item.price?.totalAmount ?? item.price?.amount;
  if (typeof fromPrice === "number" && Number.isFinite(fromPrice)) {
    return fromPrice;
  }
  if (typeof item.totalAmount === "number" && Number.isFinite(item.totalAmount)) {
    return item.totalAmount;
  }
  const productPrice =
    item.product?.standupPouchPrice?.count_0?.discountedPrice ??
    item.product?.standupPouchPrice?.count_0?.amount ??
    item.product?.price?.amount;
  return typeof productPrice === "number" && Number.isFinite(productPrice)
    ? productPrice
    : 0;
}

function mapApiCartItem(
  item: NonNullable<GetCartResponse["data"]["cart"]["items"]>[number],
  cart: GetCartResponse["data"]["cart"] | undefined
): CartItemData {
  const originalPrice =
    item.product?.sachetPrices?.thirtyDays?.amount ||
    item.product?.price?.amount ||
    0;
  const discountedPrice =
    item.product?.sachetPrices?.thirtyDays?.discountedPrice ||
    item.product?.price?.amount ||
    0;
  const membershipDiscount =
    originalPrice > discountedPrice ? originalPrice - discountedPrice : 0;

  return {
    id: item._id || item.productId,
    productId: item.productId,
    title: item.product?.title || "",
    description: item.product?.shortDescription || "",
    price: getCartItemPrice(item),
    originalPrice:
      originalPrice !== discountedPrice ? originalPrice : undefined,
    quantity: item.quantity ?? 0,
    image: resolveProductImageUrl(item.product),
    variantType: item.variantType,
    planDays: item.planDays ?? null,
    capsuleCount:
      item.product?.standupPouchPrice?.count_0?.capsuleCount ??
      item.product?.sachetPrices?.thirtyDays?.capsuleCount ??
      null,
    isOneTime: item.isOneTime,
    membershipDiscount:
      membershipDiscount > 0 ? membershipDiscount : undefined,
    currency:
      item.price?.currency ??
      (cart && typeof cart.subtotal === "object"
        ? cart.subtotal.currency
        : undefined),
  };
}

export default function CartSidebar() {
  const { isOpen, closeCart } = useCartSidebar();
  const router = useRouter();
  const t = useTranslations("Cart");
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [pricing, setPricing] = useState<CartPricing>(defaultPricing);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [cartId, setCartId] = useState<string>("");
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
  const [triggerGetCart, { isFetching, data: cartResponse }] = useLazyGetCartQuery();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [addCartItem] = useAddCartItemMutation();
  const [removeCoupon] = useRemoveCouponMutation();

  const suggestions = useMemo<ProductSuggestion[]>(() => {
    const apiSuggestions = cartResponse?.data?.suggestedProducts ?? [];

    return apiSuggestions
      .filter((p) => p.title?.trim())
      .map((p) => {
        const variantType = resolveCartVariantType(p);
        return {
          id: p._id,
          title: p.title,
          description: p.shortDescription,
          image: resolveProductImageUrl(p),
          variantType,
          planDays:
            variantType === "STAND_UP_POUCH"
              ? p.standupPouchPrice?.count_0?.capsuleCount ?? 60
              : undefined,
        };
      });
  }, [cartResponse]);

  const refreshCart = async () => {
    try {
      setIsRefetching(true);
      const res = await triggerGetCart().unwrap();
      const cart = res?.data?.cart;
      if (cart?._id) setCartId(cart._id);
      const apiItems = cart?.items ?? [];
      const mappedItems: CartItemData[] = apiItems
        .filter((item) => item.product?.title?.trim())
        .map((item) => mapApiCartItem(item, cart));
      setCartItems(mappedItems);
      if (cart) {
        setPricing({
          subtotal:
            typeof cart.subtotal === "object"
              ? cart.subtotal.amount ?? 0
              : (cart as any).subtotal ?? 0,
          tax:
            typeof cart.tax === "object"
              ? cart.tax.amount ?? 0
              : (cart as any).tax ?? 0,
          shipping:
            typeof cart.shipping === "object"
              ? cart.shipping.amount ?? 0
              : (cart as any).shipping ?? 0,
          discount:
            typeof cart.discount === "object"
              ? cart.discount.amount ?? 0
              : (cart as any).discount ?? 0,
          total: (cart as any).totalAmount ?? (
            typeof cart.total === "object"
              ? cart.total.amount ?? 0
              : cart.total ?? 0
          ),
          couponDiscountAmount: (cart as any).couponDiscountAmount ?? 0,
          currency: (cart as any).currency,
        });

        // Handle coupon code from API response
        if ((cart as any)?.couponCode && (cart as any)?.couponDiscountAmount > 0) {
          setCouponCode((cart as any).couponCode);
          setIsCouponApplied(true);
        } else {
          setCouponCode("");
          setIsCouponApplied(false);
        }
      }
    } catch (e) {
      // ignore refresh errors
    } finally {
      setIsRefetching(false);
    }
  };

  const handleIncrement = async (id: string) => {
    try {
      // Set loading state for this item
      setLoadingItemId(id);

      // Find the cart item to get details
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) {
        console.error("Cart item not found:", id);
        return;
      }

      const newQuantity = cartItem.quantity + 1;

      // Optimistically update UI
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Call API to update quantity
      await addCartItem({
        productId: cartItem.productId,
        variantType: cartItem.variantType || "SACHETS",
        quantity: newQuantity,
      }).unwrap();

      setLoadingItemId(null);

      // Refresh cart data from server
      await refreshCart();
    } catch (error) {
      console.error("Failed to increment cart item:", error);
      // Revert optimistic update on error
      await refreshCart();
    } finally {
      // Clear loading state
      setLoadingItemId(null);
    }
  };

  const handleDecrement = async (id: string) => {
    try {
      // Set loading state for this item
      setLoadingItemId(id);

      // Find the cart item to get details
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) {
        console.error("Cart item not found:", id);
        return;
      }

      const newQuantity = Math.max(1, cartItem.quantity - 1);

      // If quantity would be 0, delete the item instead
      if (newQuantity < 1) {
        await handleDelete(id);
        return;
      }

      // Optimistically update UI
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      // Call API to update quantity
      await addCartItem({
        productId: cartItem.productId,
        variantType: cartItem.variantType || "SACHETS",
        quantity: newQuantity,
      }).unwrap();

      setLoadingItemId(null);

      // Refresh cart data from server
      await refreshCart();
    } catch (error) {
      console.error("Failed to decrement cart item:", error);
      // Revert optimistic update on error
      await refreshCart();
    } finally {
      // Clear loading state
      setLoadingItemId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Set loading state for this item
      setLoadingItemId(id);

      // Find the cart item to get the productId
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) {
        console.error("Cart item not found:", id);
        return;
      }
      await removeCartItem({ 
        productId: cartItem.productId,
        variantType: cartItem.variantType 
      }).unwrap();
      setLoadingItemId(null);
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    } finally {
      // Clear loading state
      setLoadingItemId(null);
    }
  };

  const handleAddProduct = async (productId: string) => {
    try {
      const apiProduct = cartResponse?.data?.suggestedProducts?.find(
        (product) => product._id === productId
      );
      if (!apiProduct) return;

      await addCartItem(buildAddCartItemPayload(productId, apiProduct as any)).unwrap();
      await refreshCart();
    } catch (error: any) {
      console.error("Failed to add product to cart:", error);
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleCouponApplied = (discountAmount: number, finalAmount: number) => {
    setPricing((prev) => ({
      ...prev,
      discount: discountAmount,
      total: finalAmount,
    }));
  };

  const handleRemoveCoupon = async () => {
    if (!cartId || !couponCode) return;

    try {
      await removeCoupon({
        cartId,
        couponCode,
        planDurationDays: 30, // Default to 30 days for normal cart
        language: "en",
      }).unwrap();
      setCouponCode("");
      setIsCouponApplied(false);
      await refreshCart();
      toast.success(t("couponRemovedSuccessfully"));
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      toast.error(t("failedToRemoveCoupon"));
    }
  };

  // Calculate discount percentage based on subtotal vs discount
  const discountPercentage =
    pricing.subtotal > 0 && pricing.discount > 0
      ? Math.round((pricing.discount / pricing.subtotal) * 100)
      : 0;

  // Reset coupon state when cart becomes empty
  useEffect(() => {
    if (cartItems.length === 0 && (couponCode || isCouponApplied)) {
      // Remove coupon from server if cart is empty
      if (cartId && couponCode) {
        handleRemoveCoupon();
      } else {
        // Reset local state
        setCouponCode("");
        setIsCouponApplied(false);
      }
      // Close discount input accordion
      setShowDiscountInput(false);
    }
  }, [cartItems.length, couponCode, isCouponApplied, cartId]);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Fetch cart when sidebar opens
      setIsLoading(true);
      (async () => {
        try {
          const res = await triggerGetCart().unwrap();
          const cart = res?.data?.cart;
          const apiItems = cart?.items ?? [];
          const mappedItems: CartItemData[] = apiItems
            .filter((item) => item.product?.title?.trim())
            .map((item) => mapApiCartItem(item, cart));
          setCartItems(mappedItems);

          // Set cart ID and coupon info
          if (cart?._id) {
            setCartId(cart._id);
          }

          if ((cart as any)?.couponCode && (cart as any)?.couponDiscountAmount > 0) {
            setCouponCode((cart as any).couponCode);
            setIsCouponApplied(true);
          } else {
            setCouponCode("");
            setIsCouponApplied(false);
          }

          // Extract pricing directly from API response
          if (cart) {
            setPricing({
              subtotal:
                typeof cart.subtotal === "object"
                  ? cart.subtotal.amount ?? 0
                  : cart.subtotal ?? 0,
              tax:
                typeof cart.tax === "object"
                  ? cart.tax.amount ?? 0
                  : cart.tax ?? 0,
              shipping:
                typeof cart.shipping === "object"
                  ? cart.shipping.amount ?? 0
                  : cart.shipping ?? 0,
              discount:
                typeof cart.discount === "object"
                  ? cart.discount.amount ?? 0
                  : cart.discount ?? 0,
              total: (cart as any).totalAmount ?? (
                typeof cart.total === "object"
                  ? cart.total.amount ?? 0
                  : cart.total ?? 0
              ),
              couponDiscountAmount: (cart as any).couponDiscountAmount,
              currency: (cart as any).currency,
            });
          }

        } catch (e) {
          // On error, clear data
          setCartItems([]);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-100 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-[500px] max-w-[94vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <CartHeader />

        {/* Body scroll */}
        <div
          className={`flex-1 min-h-0 ${
            isRefetching ? "overflow-y-hidden" : "overflow-y-auto"
          } gray-scrollbar`}
        >
          {isRefetching && <Loading />}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-teal-green-color border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-charcol-color">{t("loadingCart")}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Empty state top message */}
              <CartEmptyState cartItems={cartItems?.length || 0} />

              {/* Offer Progress Bar */}
              {/* <div className="mt-5 mx-5">
                                <OfferProgress />
                            </div> */}

              {/* Product Carousel */}
              {suggestions.length > 0 && (
                <ProductCarousel
                  products={suggestions}
                  onAddProduct={handleAddProduct}
                />
              )}

              {/* Cart Items List */}
              <CartItemsList
                items={cartItems}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onDelete={handleDelete}
                postageCost={pricing.shipping}
                discount={pricing.discount}
                tax={pricing.tax}
                subtotal={pricing.subtotal}
                total={pricing.total}
                currency={pricing.currency}
                loadingItemId={loadingItemId}
                couponDiscountAmount={pricing.couponDiscountAmount}
              />
            </>
          )}
        </div>

        {/* Footer summary */}
        <CartFooter
          originalPrice={pricing.subtotal}
          discountedPrice={pricing.total}
          discountPercentage={discountPercentage}
          onCheckout={handleCheckout}
          showDiscountInput={showDiscountInput}
          onToggleDiscountInput={setShowDiscountInput}
          orderTotal={pricing.total}
          onCouponApplied={handleCouponApplied}
          cartId={cartId}
          onRefreshCart={refreshCart}
          currency={pricing.currency}
          isCartEmpty={cartItems.length === 0}
          couponCode={couponCode}
          isCouponApplied={isCouponApplied}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </aside>
    </div>
  );
}
