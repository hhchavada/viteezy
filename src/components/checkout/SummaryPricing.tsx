import React from "react";
import { useTranslations } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";

interface SummaryPricingProps {
  pricing?: {
    subTotal: number;
    discountedPrice: number;
    grandTotal: number;
    membershipDiscountAmount: number;
    subscriptionPlanDiscountAmount: number;
    couponDiscountAmount: number;
    taxAmount: number;
    currency: string;
  };
  isValidating?: boolean;
}

const SummaryPricing: React.FC<SummaryPricingProps> = ({
  pricing,
  isValidating,
}) => {
  const tCart = useTranslations("Cart");
  const tCheckout = useTranslations("Checkout");
  if (!pricing) return null;

  return (
    <div className="border-t border-gray-200 pt-5 space-y-2 font-medium text-sm">
      {isValidating && (
        <div className="text-sm text-gray-500 mb-2">{tCheckout("validatingCart")}</div>
      )}

      {/* Subtotal */}
      {pricing.subTotal > 0 && (
        <div className="flex justify-between">
          <span className="">{tCart("subtotal")}</span>
          <span className="">
            {getCurrencySymbol(pricing.currency)}{pricing.subTotal.toFixed(2)}
          </span>
        </div>
      )}

      {/* Discounted Price */}
      {pricing.discountedPrice > 0 && (
        <div className="flex justify-between">
          <span className="">{tCheckout("discountedPrice")}</span>
          <span className="">
            {getCurrencySymbol(pricing.currency)}{pricing.discountedPrice.toFixed(2)}
          </span>
        </div>
      )}

      {/* Subscription Plan Discount */}
      {pricing.subscriptionPlanDiscountAmount > 0 && (
        <div className="flex justify-between">
          <span className="">{tCheckout("subscriptionDiscount")}</span>
          <span className="text-green-600">
            -{getCurrencySymbol(pricing.currency)}{pricing.subscriptionPlanDiscountAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Membership Discount */}
      {pricing.membershipDiscountAmount > 0 && (
        <div className="flex justify-between">
          <span className="">{tCheckout("membershipDiscount")}</span>
          <span className="text-green-600">
            -{getCurrencySymbol(pricing.currency)}{pricing.membershipDiscountAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Coupon Discount */}
      {pricing.couponDiscountAmount > 0 && (
        <div className="flex justify-between">
          <span className="">{tCart("couponDiscount")}</span>
          <span className="text-green-600">
            -{getCurrencySymbol(pricing.currency)}{pricing.couponDiscountAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Tax */}
      {pricing.taxAmount > 0 && (
        <div className="flex justify-between">
          <span className="">{tCart("tax")}</span>
          <span className="">
            {getCurrencySymbol(pricing.currency)}{pricing.taxAmount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between">
        <span className="">{tCart("shipping")}</span>
        <span className="">{tCart("free")}</span>
      </div>

      {/* Grand Total */}
      {pricing.grandTotal > 0 && (
        <div className="flex justify-between text-xl font-semibold pt-4 mt-5 border-t border-gray-200">
          <span className="text-gray-900">{tCart("total")}</span>
          <span className="text-gray-900">
            {getCurrencySymbol(pricing.currency)}{pricing.grandTotal.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SummaryPricing;
