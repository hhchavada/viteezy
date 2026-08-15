import React from "react";
import { useTranslations } from "next-intl";

export default function CartEmptyState({ cartItems }: { cartItems: number }) {
  const t = useTranslations("Cart");
  const text =
    cartItems === 1
      ? t("basketItem", { count: cartItems })
      : t("basketItems", { count: cartItems });
  return (
    <div className="px-5 pt-5 flex flex-col items-center">
      <h3 className="text-2xl font-medium text-center 3xl:text-[33px]">
        {cartItems > 0 ? text : t("basketEmpty")}
      </h3>
      <div className="text-center justify-center max-w-56 line-clamp-2 font-medium text-charcol-color text-xs 3xl:text-sm mt-2">
        {t("upToDiscount")}
        {t("products")}
      </div>
    </div>
  );
}
