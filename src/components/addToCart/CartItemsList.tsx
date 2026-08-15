"use client";
import CartItem from "./CartItem";
import CartCostSummary from "./CartCostSummary";
import PaymentMethodsDisplay from "./PaymentMethodsDisplay";
import { CartItemData } from "../types";
import { useTranslations } from "next-intl";

interface CartItemsListProps {
  items: CartItemData[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onDelete?: (id: string) => void;
  postageCost?: number;
  discount?: number;
  tax?: number;
  subtotal?: number;
  total?: number;
  currency?: string;
  loadingItemId?: string | null;
  couponDiscountAmount?: number;
}

export default function CartItemsList({
  items,
  onIncrement,
  onDecrement,
  onDelete,
  postageCost = 0,
  discount = 0,
  tax = 0,
  subtotal = 0,
  total = 0,
  currency = "USD",
  loadingItemId = null,
  couponDiscountAmount = 0,
}: CartItemsListProps) {
  const t = useTranslations("Cart");
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="px-5 mt-3 bg-off-white-color">
      <h4 className="text-center text-sm sm:text-base font-medium text-charcol-color py-3 3xl:text-[19px]">
        {t("youHaveProducts", {
          count: items.length,
          product: items.length === 1 ? t("product") : t("products"),
        })}
      </h4>

      {items.map((item) => (
          <CartItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            price={item.price}
            originalPrice={item.originalPrice}
            quantity={item.quantity}
            image={item.image}
            variantType={item.variantType}
            planDays={item.planDays}
            capsuleCount={item.capsuleCount}
            isOneTime={item.isOneTime}
            membershipDiscount={item.membershipDiscount}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onDelete={onDelete}
            currency={item.currency ?? currency}
            isLoading={loadingItemId === item.id}
          />
        ))}

      <CartCostSummary
        postageCost={postageCost}
        discount={discount}
        tax={tax}
        subtotal={subtotal}
        total={total}
        currency={currency}
        couponDiscountAmount={couponDiscountAmount}
      />

      <div className="my-4">
        <div className="h-px bg-neutral-light" />
      </div>

      <PaymentMethodsDisplay />
    </div>
  );
}
