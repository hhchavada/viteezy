import { OrderLineItem } from "@/types/recommendations";

interface OrderLineRowProps {
  item: OrderLineItem;
}

export default function OrderLineRow({ item }: OrderLineRowProps) {
  const isTotal = item.variant === "total";
  const isDiscount = item.variant === "discount";

  return (
    <div
      className={`flex items-start justify-between gap-2 ${
        isTotal ? "mt-3 pt-1" : ""
      }`}
    >
      <span
        className={`min-w-0 font-saans text-xs font-normal sm:text-sm lg:text-base ${
          isDiscount ? "text-teal-green-color" : "text-black-color"
        }`}
      >
        {item.label}
      </span>
      <span
        className={`shrink-0 text-right font-saans text-xs font-normal sm:text-sm lg:text-base ${
          isDiscount ? "text-teal-green-color" : "text-black-color"
        }`}
      >
        {item.value}
      </span>
    </div>
  );
}
