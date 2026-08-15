"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidateCouponMutation, useRemoveCouponMutation } from "@/store/api/cartApi";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface DiscountCodeProps {
  coupon?: {
    code: string;
    isValid: boolean;
    discountAmount: number;
    message: string;
  } | null;
  cartId?: string;
  orderTotal?: number;
  onCouponApplied?: (discountAmount: number, finalAmount: number) => void;
  onRefreshCart?: (opts?: {
    appliedCode?: string;
    removed?: boolean;
  }) => Promise<void> | void;
  onRemoveCoupon?: () => void;
}

const DiscountCode: React.FC<DiscountCodeProps> = ({
  coupon,
  cartId,
  orderTotal,
  onCouponApplied,
  onRefreshCart,
  onRemoveCoupon,
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
  const [removeCoupon, { isLoading: isRemoving }] = useRemoveCouponMutation();
  const locale = useLocale();
  const t = useTranslations("Cart");

  useEffect(() => {
    if (coupon?.code) {
      setDiscountCode(coupon.code);
    }
  }, [coupon]);

  const handleApply = async () => {
    const code = discountCode.trim();
    if (!code) {
      toast.error(t("pleaseEnterDiscountCode"));
      return;
    }
    if (!cartId) {
      toast.error(t("cartIdMissing"));
      return;
    }

    try {
      const response = await validateCoupon({
        couponCode: code,
        cartId,
        planDurationDays: 30, // Default to 30 days for normal cart
        language: locale || "en",
      }).unwrap();

      if (response.success) {
        const successMessage = response.message || t("couponAppliedSuccessfully");
        toast.success(successMessage);

        const discountAmount = response.data?.discountAmount ?? 0;
        const finalAmount = response.data?.finalAmount ?? Math.max((orderTotal ?? 0) - discountAmount, 0);

        onCouponApplied?.(discountAmount, finalAmount);

        if (onRefreshCart) {
          await onRefreshCart({ appliedCode: code });
        }
      } else {
        const errorMessage = response.message || t("invalidCouponCode");
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || t("failedToValidateCoupon");
      toast.error(errorMessage);
    }
  };

  const handleRemove = async () => {
    if (!cartId || !discountCode) return;

    try {
      await removeCoupon({
        cartId,
        couponCode: discountCode,
        planDurationDays: 30, // Default to 30 days for normal cart
        language: locale || "en",
      }).unwrap();

      toast.success(t("couponRemovedSuccessfully"));

      setDiscountCode("");
      onRemoveCoupon?.();
      
      if (onRefreshCart) {
        await onRefreshCart({ removed: true });
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || t("failedToRemoveCoupon");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="">
      {coupon?.isValid ? (
        // Show applied coupon state
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-white border rounded-lg opacity-70">
            <span className="text-green-700 font-medium">
              {coupon?.code || discountCode}
            </span>
          </div>
          <Button
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-4 py-3 rounded-lg text-sm bg-black hover:bg-gray-800 text-white"
            variant="elevate"
            size="elevate"
            animateText
          >
            {isRemoving ? t("removing") : t("remove")}
          </Button>
        </div>
      ) : (
        // Show input field for entering coupon
        <div className="flex gap-2">
          <InputField
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder={t("enterDiscountCode")}
            className="flex-1 rounded-lg h-full"
          />
          <Button
            onClick={handleApply}
            disabled={isValidating}
            className="h-auto px-7 sm:px-8 rounded-lg text-sm sm:text-base leading-relaxed sm:leading-normal  bg-black"
            animateText
            variant="elevate"
            size="elevate"
          >
            {isValidating ? t("applying") : t("apply")}
          </Button>
        </div>
      )}
      {/* {coupon?.isValid && coupon?.message && (
        <p className="text-sm text-green-600 mt-2">{coupon.message}</p>
      )} */}
    </div>
  );
};

export default DiscountCode;
