import React from "react";
import { useTranslations } from "next-intl";

export default function CartHeader() {
  const t = useTranslations("Cart");
  return (
    <div className="py-3">
      <div className="flex items-center justify-center">
        <h2 className="text-base font-medium text-center 3xl:text-[19px]">
          {t("myBasket")}
        </h2>
      </div>
      <hr className="mt-2.5"/>
      {/* <div className="mt-3 w-full h-6 flex items-center justify-center text-xs 3xl:text-sm font-medium bg-[linear-gradient(90deg,#ECD2BC_0%,#B8E2D0_30%,#C6E2F1_70%,#B5E5AD_100%)]">
        {t("freeDeliveryOver")}
      </div> */}
    </div>
  );
}
