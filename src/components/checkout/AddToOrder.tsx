"use client";

import React, { useState } from "react";
import FallbackImage from "@/components/ui/fallbackImage";
import { Button } from "@/components/ui/button";
import { Package, Truck, Star } from "lucide-react";
import { CheckoutSuggestedProduct } from "@/store/api/types/cart.types";
import {
  useAddCartItemMutation,
  baseApi,
  useAppDispatch,
  useGetCartQuery,
  useGetQuizRecommendationCartQuery,
} from "@/store";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  buildAddCartItemPayload,
  getCurrencySymbol,
  isRemoteImageUrl,
} from "@/lib/utils";
import type { QuizRecommendationCartRequest } from "@/store/api/cartApi";

interface AddToOrderProps {
  suggestedProducts: CheckoutSuggestedProduct[];
  currency?: string;
  onRefreshCheckout?: () => void;
  isQuizCheckout?: boolean;
  quizCartParams?: QuizRecommendationCartRequest;
}

const AddToOrder: React.FC<AddToOrderProps> = ({
  suggestedProducts,
  currency,
  onRefreshCheckout,
  isQuizCheckout = false,
  quizCartParams,
}) => {
  const tCart = useTranslations("Cart");
  const tCheckout = useTranslations("Checkout");
  const t = useTranslations("Header"); // Main namespace for "adding" translation
  const [addCartItem, { isLoading }] = useAddCartItemMutation();
  const dispatch = useAppDispatch();
  const { data: normalCartData } = useGetCartQuery(undefined, {
    skip: isQuizCheckout,
  });
  const { data: quizCartData } = useGetQuizRecommendationCartQuery(
    quizCartParams!,
    {
      skip: !isQuizCheckout || !quizCartParams,
    }
  );
  const cartData = isQuizCheckout ? quizCartData : normalCartData;
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const defaultCurrency = currency;

  const handleAdd = async (productId: string) => {
    try {
      setLoadingProductId(productId);
      const suggestedProduct = suggestedProducts.find(
        (product) => product.productId === productId
      );
      const cartSuggestedProduct = cartData?.data?.suggestedProducts?.find(
        (product: { _id?: string }) => product._id === productId
      );

      await addCartItem(
        buildAddCartItemPayload(productId, cartSuggestedProduct ?? {
          variant: suggestedProduct?.variant,
          hasStandupPouch: suggestedProduct?.variant === "STAND_UP_POUCH",
          variants:
            suggestedProduct?.variant === "STAND_UP_POUCH"
              ? ["stand_up_pouch"]
              : ["sachets"],
        })
      ).unwrap();
      // Invalidate Cart tag so cart sidebar and checkout summary refetch
      dispatch(baseApi.util.invalidateTags(["Cart"]));
      // Refresh checkout data after successful addition
      onRefreshCheckout?.();
      toast.success(tCheckout("addedToCartSuccessfully"));
    } catch (error) {
      console.error("Failed to add product:", error);
      const message =
        (error as any)?.data?.message ||
        (error as any)?.message ||
        tCheckout("productUnavailableForSelectedVariant");
      toast.error(message);
    } finally {
      setLoadingProductId(null);
    }
  };

  // if (!suggestedProducts || suggestedProducts.length === 0) {
  //   return null;
  // }

  return (
    <div className="">
      {suggestedProducts?.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {tCheckout("addToThisOrder")}
            {/* ({suggestedProducts.length}) */}
          </h2>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2  ">
            {suggestedProducts.map((product) => (
              <div
                key={product.productId}
                className="flex p-3 items-center gap-4  border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white"
              >
                <div className="relative w-22.5 h-22.5 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <FallbackImage
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized={isRemoteImageUrl(product.image)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {product.variant}
                  </p>
                  <div className="flex gap-5 items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {getCurrencySymbol(product.currency || defaultCurrency)}
                      {product.price.toFixed(2)}
                    </span>
                    <Button
                      variant="outlineElevate"
                      size="sm"
                      onClick={() => handleAdd(product.productId)}
                      disabled={loadingProductId === product.productId}
                      className="shrink-0 rounded-2xl hover:rounded-md border-black text-base py-4 px-5 leading-tight 3xl:leading-relaxed"
                      animateText
                    >
                      {loadingProductId === product.productId
                        ? t("adding")
                        : tCheckout("add")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Additional Information */}
      <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 text-base">
          <Package className="h-5 w-5 shrink-0" strokeWidth={1.6} />
          <span>{tCheckout("orderedBeforeDeliveredNextBusinessDay")}</span>
        </div>
        {/* <div className="flex items-center gap-3 text-base">
          <Truck className="h-5 w-5 shrink-0" strokeWidth={1.6} />
          <span>{tCheckout("freeShippingFromAmount", { amount: "$40" })}</span>
        </div>
        <div className="flex items-center gap-3 text-base">
          <Star className="h-5 w-5 shrink-0" strokeWidth={1.6} />
          <span>
            {tCheckout("ratedFromReviews", {
              rating: "4.7/5.0",
              reviews: "1800+",
            })}
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default AddToOrder;
