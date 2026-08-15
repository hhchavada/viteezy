import React from "react";
import { getCurrencySymbol } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CartCostSummaryProps {
  postageCost: number;
  discount: number;
  tax?: number;
  subtotal?: number;
  total?: number;
  currency?: string;
  couponDiscountAmount?: number;
}

export default function CartCostSummary({
  postageCost,
  discount,
  tax = 0,
  subtotal = 0,
  total = 0,
  currency = "USD",
  couponDiscountAmount = 0,
}: CartCostSummaryProps) {
  const t = useTranslations("Cart");
  const symbol = getCurrencySymbol(currency);
  return (
    <div className="mt-4 px-1 text-sm">
      {subtotal > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-xs 3xl:text-sm">{t("subtotal")}</span>
          <span className="text-xs 3xl:text-sm">
            {symbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
      )}
      {couponDiscountAmount > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-xs 3xl:text-sm">{t("couponDiscount")}</span>
          <span className="text-xs 3xl:text-sm text-green-600">
            -{symbol}
            {couponDiscountAmount?.toFixed(2)}
          </span>
        </div>
      )}
      <div className="flex justify-between py-1">
        <span className="text-xs 3xl:text-sm">{t("shipping")}</span>
        <span className="text-xs 3xl:text-sm">
          {postageCost === 0 ? t("free") : `${symbol}${postageCost.toFixed(2)}`}
        </span>
      </div>
      {tax > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-xs 3xl:text-sm">{t("tax")}</span>
          <span className="text-xs 3xl:text-sm">
            {symbol}
            {tax.toFixed(2)}
          </span>
        </div>
      )}
      {discount > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-xs 3xl:text-sm">{t("discount")}</span>
          <span className="text-xs 3xl:text-sm text-green-600">
            - {symbol}
            {discount.toFixed(2)}
          </span>
        </div>
      )}
      {total > 0 && (
        <div className="flex justify-between py-1">
          <span className="text-xs font-medium 3xl:text-sm">{t("total")}</span>
          <span className="text-xs font-semibold 3xl:text-sm">
            {symbol}
            {total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
