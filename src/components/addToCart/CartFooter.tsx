"use client";
import { useState, useEffect } from "react";
import { useValidateCouponMutation } from "@/store/api/cartApi";
import Link from "next/link";
import { Button } from "../ui/button";
import { useCartSidebar } from "@/lib/cartSidebar";
import { toast } from "react-hot-toast";
import { useLocale } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CartFooterProps {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  onCheckout: () => void;
  showDiscountInput?: boolean;
  onToggleDiscountInput?: (show: boolean) => void;
  orderTotal: number;
  onCouponApplied?: (discountAmount: number, finalAmount: number) => void;
  cartId: string;
  onRefreshCart?: () => Promise<void> | void;
  currency?: string;
  isCartEmpty?: boolean;
  couponCode?: string;
  isCouponApplied?: boolean;
  onRemoveCoupon?: () => void;
}

export default function CartFooter({
  originalPrice,
  discountedPrice,
  discountPercentage,
  onCheckout,
  showDiscountInput: externalShowDiscountInput,
  onToggleDiscountInput,
  orderTotal,
  onCouponApplied,
  cartId,
  onRefreshCart,
  currency = "USD",
  isCartEmpty = false,
  couponCode = "",
  isCouponApplied = false,
  onRemoveCoupon,
}: CartFooterProps) {
  const t = useTranslations("Cart");
  const symbol = getCurrencySymbol(currency);
  const [internalShowDiscountInput, setInternalShowDiscountInput] =
    useState(false);
  const [discountCode, setDiscountCode] = useState(couponCode || "");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [validateCoupon, { isLoading: isValidating }] =
    useValidateCouponMutation();
  const { closeCart } = useCartSidebar();
  const locale = useLocale();

  // Update discount code when couponCode prop changes
  useEffect(() => {
    setDiscountCode(couponCode || "");
  }, [couponCode]);

  // Use external state if provided, otherwise use internal state
  const showDiscountInput =
    externalShowDiscountInput !== undefined
      ? externalShowDiscountInput
      : internalShowDiscountInput;

  // Close accordion when cart becomes empty
  useEffect(() => {
    if (isCartEmpty && showDiscountInput && onToggleDiscountInput) {
      onToggleDiscountInput(false);
    } else if (isCartEmpty && showDiscountInput) {
      setInternalShowDiscountInput(false);
    }
  }, [isCartEmpty, showDiscountInput, onToggleDiscountInput]);

  const toggleDiscountInput = () => {
    if (onToggleDiscountInput) {
      onToggleDiscountInput(!showDiscountInput);
    } else {
      setInternalShowDiscountInput(!internalShowDiscountInput);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setCouponError(t("pleaseEnterDiscountCode"));
      setCouponSuccess(null);
      toast.error(t("pleaseEnterDiscountCode"));
      return;
    }

    if (!cartId) {
      setCouponError(t("cartIdMissing"));
      toast.error(t("cartIdMissing"));
      return;
    }

    // Clear previous messages before validation
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const response = await validateCoupon({
        couponCode: discountCode.trim(),
        cartId: cartId,
        language: locale || "en",
      }).unwrap();

      // If API returns 200 OK and success is true, show success message
      if (response.success) {
        // Show success message from API
        const successMessage =
          response.message || t("couponAppliedSuccessfully");
        setCouponError(null); // Explicitly clear error
        setCouponSuccess(successMessage);
        toast.success(successMessage);

        // Extract discount info from response
        const discountAmount =
          response.data?.discountAmount ?? 0;
        const finalAmount =
          response.data?.finalAmount ?? orderTotal - discountAmount;
        onCouponApplied?.(discountAmount, finalAmount);

        // Refresh cart if handler is provided
        if (onRefreshCart) {
          await onRefreshCart();
        }
      } else {
        // API returned 200 but success is false - show error
        const errorMessage = response.message || t("invalidCouponCode");
        setCouponSuccess(null); // Explicitly clear success
        setCouponError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // API error - show error message
      const errorMessage =
        error?.data?.message || error?.message || t("failedToValidateCoupon");
      setCouponSuccess(null); // Explicitly clear success
      setCouponError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full shrink-0">
      <div className="bg-teal-green-color rounded-t-xl">
        {/* Subtotal section (green background) */}
        <div className="px-5 pb-4 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white 3xl:text-sm">{t("total")}</span>
            {discountPercentage > 0 && (
              <span className="bg-pastel-yellow-color text-soft-orange-color text-xs 3xl:text-sm font-semibold px-2 py-1 rounded">
                {t("discountPercentageOff", { percentage: discountPercentage })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {discountPercentage > 0 && (
              <span className="text-white/70 line-through text-sm  3xl:text-base">
                {symbol}{originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-white text-base 3xl:text-lg">
              {symbol}{discountedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Discount + {t("checkout")} Section (White, rounded top corners) */}
        <div className="bg-white rounded-t-xl px-3 sm:px-5 pt-4 pb-4 -mt-2">
          <div className="bg-off-white-color rounded-lg">
            <button
              onClick={toggleDiscountInput}
              disabled={isCartEmpty}
              className={`flex items-center justify-between w-full text-left bg-neutral-sand-50 px-4 py-3 rounded-xl ${isCartEmpty ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
            >
              <span className="text-sm font-medium 3xl:text-base">
                {t("discountCodeOrReferredByFriend")}
              </span>
              <svg
                className={`w-6 h-6 text-charcol-color transition-transform duration-200 bg-white rounded-full ${showDiscountInput ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showDiscountInput ? (
                  // Minus icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14"
                  />
                ) : (
                  // Plus icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v14m7-7H5"
                  />
                )}
              </svg>
            </button>

            {/* SMOOTH OPEN/CLOSE */}
            <div
              className={`transition-all duration-500 overflow-hidden ${showDiscountInput ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="flex flex-col gap-2 px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("enterDiscountCode")}
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setCouponError(null);
                      setCouponSuccess(null);
                    }}
                    className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success-green-500 w-full sm:w-auto ${
                      isCouponApplied
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                        : "border-neutral-sand-100 bg-white"
                    }`}
                    disabled={isCouponApplied}
                  />
                  <button
                    onClick={isCouponApplied ? onRemoveCoupon : handleApplyDiscount}
                    disabled={isValidating || isCartEmpty}
                    className="ms-auto block px-6 py-2.5 bg-black text-slate-50 rounded-lg text-sm  3xl:text-base font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCouponApplied ? t("remove") : (isValidating ? t("applying") : t("apply"))}
                  </button>
                </div>
                {/* {couponError && (
                  <p className="text-xs text-red-500 3xl:text-sm">
                    {couponError}
                  </p>
                )} */}
                {/* {couponSuccess && (
                  <p className="text-xs text-green-600 3xl:text-sm">
                    {couponSuccess}
                  </p>
                )} */}
              </div>
            </div>
          </div>

          {/* {t("checkout")} Button */}
          <Button
            size="elevate"
            variant="elevate"
            animateText
            disabled={isCartEmpty}
            className="w-full text-base 3xl:text-lg mt-3 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (!isCartEmpty) {
                closeCart();
                onCheckout();
              }
            }}
          >
            {t("checkout")}
          </Button>

          <p className="text-center text-xs text-charcol-color font-medium 3xl:text-sm">
            {t("shippingAndSettlementEveryMonths", { months: 3 })}
          </p>
        </div>
      </div>
    </div>
  );
}
