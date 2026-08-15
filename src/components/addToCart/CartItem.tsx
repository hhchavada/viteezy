"use client";
import { TrashIcon, Plus, Minus } from "../icons";
import { getCurrencySymbol, isRemoteImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import FallbackImage from "../ui/fallbackImage";
import { useCartItemVariantLabel } from "@/hooks/useCartItemVariantLabel";

interface CartItemProps {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variantType?: "STAND_UP_POUCH" | "SACHETS";
  planDays?: number | null;
  capsuleCount?: number | null;
  isOneTime?: boolean;
  membershipDiscount?: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onDelete?: (id: string) => void;
  currency?: string;
  isLoading?: boolean;
}

export default function CartItem({
  id,
  title,
  description,
  price,
  originalPrice,
  quantity,
  image,
  variantType,
  planDays,
  capsuleCount,
  isOneTime,
  membershipDiscount,
  onIncrement,
  onDecrement,
  onDelete,
  currency = "USD",
  isLoading = false,
}: CartItemProps) {
  const tCommon = useTranslations("Common");
  const variantLabel = useCartItemVariantLabel(variantType, {
    planDays,
    capsuleCount,
    isOneTime,
  });
  const symbol = getCurrencySymbol(currency);

  const hasDiscount = originalPrice && originalPrice > price;

  const isStandUpPouch = variantType === "STAND_UP_POUCH";

  return (
    <div className="mt-3">
      {/* Card container with overflow-hidden so bottom banner clips to rounded corners */}
      <div className="bg-white border border-neutral-sand-100 rounded-xl overflow-hidden relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        {/* Content row */}
        <div className="p-2 sm:p-3 flex items-center gap-2.5 sm:gap-3">
          {/* Product Image */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-sand-100 shrink-0">
            <FallbackImage
              src={image}
              alt={title}
              fill
              className="object-cover"
              unoptimized={isRemoteImageUrl(image)}
            />
          </div>

          {/* Product Info — left details column + right price group */}
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            {/* Group 1: title, variant, actions */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                {title}
              </h4>

              {variantLabel ? (
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {variantLabel}
                </p>
              ) : (
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {description}
                </span>
              )}

              {(onDelete || isStandUpPouch) && (
                <div className="flex items-center gap-2 sm:gap-3">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(id)}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md border border-linen-color bg-white hover:bg-neutral-50 cursor-pointer shrink-0"
                      aria-label={tCommon("removeItemAria")}
                    >
                      <TrashIcon />
                    </button>
                  )}
                  {isStandUpPouch && (
                    <div className="flex items-center border border-linen-color rounded-md h-6 sm:h-7 w-fit shrink-0">
                      {quantity > 1 && (
                        <button
                          onClick={() => onDecrement(id)}
                          className="w-6 sm:w-7 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-md transition-colors text-charcol-color border-r border-linen-color cursor-pointer"
                          type="button"
                        >
                          <Minus />
                        </button>
                      )}
                      <span className="w-6 sm:w-7 text-center text-xs sm:text-sm font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onIncrement(id)}
                        className={`w-6 sm:w-7 h-full flex items-center justify-center hover:bg-gray-50 transition-colors text-charcol-color border-l border-linen-color cursor-pointer ${
                          quantity === 1 ? "rounded-md" : "rounded-r-md"
                        }`}
                        type="button"
                      >
                        <Plus />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Group 2: price — vertically centered */}
            <div className="flex flex-col items-end justify-center shrink-0">
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through leading-tight">
                  {symbol}
                  {originalPrice!.toFixed(2)}
                </span>
              )}
              <span className="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap leading-tight">
                {symbol}
                {price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Membership Discount banner attached to bottom */}
        {/* {membershipDiscount && membershipDiscount > 0 && (
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(27, 175, 154, 0.35) 0%, rgba(247, 161, 115, 0.35) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)",
                        }}
                    >
                        <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-black">Membership Discount</span>
                            <span className="text-sm font-semibold text-black">-{symbol}{membershipDiscount.toFixed(2)}</span>
                        </div>
                    </div>
                )} */}
      </div>
    </div>
  );
}
