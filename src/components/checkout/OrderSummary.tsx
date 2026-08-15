"use client";

import React from "react";
import Image from "next/image";
import { CheckoutCartItem } from "@/store/api/types/cart.types";
import { useTranslations } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";

interface OrderSummaryProps {
  items: CheckoutCartItem[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items }) => {
  const t = useTranslations("Cart");
  const tCheckout = useTranslations("Checkout");
  const tAccount = useTranslations("Account");

  const localizePlanType = (planType: string): string => {
    // API typically returns something like "180 Day Plan" / "1 Day Plan".
    const match = planType.match(/(\d+)\s*day[s]?/i);
    if (!match) return planType;

    const days = Number(match[1]);
    if (!Number.isFinite(days) || days <= 0) return planType;

    if (days === 1) {
      return tAccount("subscriptionOneDayPlan", { days: 1 });
    }

    return tAccount("subscriptionManyDaysPlan", { days });
  };
  // Don't show empty cart message on checkout page
  if (!items || items.length === 0) {
    // return (
    //   <div className="text-center py-8">
    //     <p className="text-gray-500">{t("cartEmpty")}</p>
    //   </div>
    // );
    return null
  }
  return (
    <div className="">
      {/* Order Items */}
      <div className="mb-3 grid grid-cols-1 gap-2.5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="rounded-[12px] bg-white border border-neutral-sand-100 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-4 p-3.5">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image || "/carosuleCardImage.png"}
                    alt={item.title || t("product")}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                    // unoptimized
                  />
                </div>
                <div className="sm:flex items-center justify-between min-w-0 w-full gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1 break-all">
                      {item.title || t("product")}
                    </h3>
                    <p className="text-base text-gray-500 mb-2">
                      {item.quantity}{" "}
                      {item.quantity === 1 ? t("item") : t("items")} •{" "}
                      {localizePlanType(item.basePlanPrice.planType)}
                    </p>
                  </div>
                  <div className="text-end">
                    {item.basePlanPrice.discountedPrice < item.basePlanPrice.amount ? (
                      <div className="flex flex-wrap items-center gap-2 sm:block sm:gap-0">
                        <span className="text-lg font-semibold text-gray-900">
                          {getCurrencySymbol(item.basePlanPrice.currency)}{item.basePlanPrice.discountedPrice.toFixed(2)}
                        </span>
                        <p className="text-sm text-gray-500 line-through">
                          {getCurrencySymbol(item.basePlanPrice.currency)}{item.basePlanPrice.amount.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        {getCurrencySymbol(item.basePlanPrice.currency)}{item.basePlanPrice.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {item.membershipDiscount > 0 && (
              <span
                className={`text-sm flex justify-between font-medium px-3.5 w-full py-2 bg-linear-to-r from-[#1baf9965] to-[#f7a1736f]`}
              >
                <span>{tCheckout("membershipDiscount")}</span>
                <span>-{getCurrencySymbol(item.basePlanPrice.currency)}{item.membershipDiscount.toFixed(2)}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSummary;
