"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { CircleCheck, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { TrashIcon } from "@/components/icons";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { CheckoutCartItem } from "@/store/api/types/cart.types";
import type { QuizCheckoutPageSummaryRequest } from "@/store/api/cartApi";
import {
  useUpdateCheckoutSelectionsMutation,
  useRemoveCartItemMutation,
} from "@/store";
import { useTranslations } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";

export type CheckoutPageSummarySelectionsBody = {
  sachets?: { planDurationDays: number };
  standUpPouch?: {
    itemQuantities: Array<{
      capsuleCount: number;
      productId: string;
      quantity: number;
    }>;
  };
  couponCode?: string;
};

export type PackagingOptionsHandle = {
  buildPageSummaryPayload: (
    couponOpts?: { couponCode?: string | null }
  ) => CheckoutPageSummarySelectionsBody;
};

interface PackagingOptionsProps {
  sachetsItems: CheckoutCartItem[];
  standUpPouchItems: CheckoutCartItem[];
  sachetsPlans: any[];
  standUpPouchPlans: Record<string, any[]>;
  onPlanSelect?: (planKey: string) => void;
  couponCode?: string;
  onRefreshCheckout?: () => void;
  quizCheckoutContext?: QuizCheckoutPageSummaryRequest;
}

const PackagingOptions = forwardRef<
  PackagingOptionsHandle,
  PackagingOptionsProps
>(function PackagingOptions(
  {
    sachetsItems,
    standUpPouchItems,
    sachetsPlans,
    standUpPouchPlans,
    onPlanSelect,
    couponCode,
    onRefreshCheckout,
    quizCheckoutContext,
  },
  ref
) {
  const tCheckout = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const tAccount = useTranslations("Account");
  const [standUpPouchOpen, setStandUpPouchOpen] = useState(true);
  const [sachetsPlansOpen, setSachetsPlansOpen] = useState(true);
  const [selectedSachetsPlan, setSelectedSachetsPlan] = useState("");
  const [updateCheckoutSelections, { isLoading: isUpdatingPlan }] =
    useUpdateCheckoutSelectionsMutation();
  const [removeCartItem, { isLoading: isDeletingItem }] =
    useRemoveCartItemMutation();

  const withQuizCheckoutPayload = useCallback(
    (payload: CheckoutPageSummarySelectionsBody) =>
      quizCheckoutContext
        ? {
            ...payload,
            cartId: quizCheckoutContext.cartId,
            cartType: quizCheckoutContext.cartType,
          }
        : payload,
    [quizCheckoutContext]
  );

  // Track capsule count and quantity for each stand-up pouch product
  const [productStates, setProductStates] = useState<
    Record<string, { capsuleCount: number; quantity: number }>
  >({});
  // Track dropdown open state for each product
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    // Initialize product states from cart items
    const initialStates: Record<
      string,
      { capsuleCount: number; quantity: number }
    > = {};
    standUpPouchItems.forEach((item) => {
      // Get plans for this product
      const plans = standUpPouchPlans[item.productId] || [];

      // Find the selected plan from the API or use the first available plan
      const selectedPlan = plans.find((plan) => plan.isSelected) || plans[0];

      if (selectedPlan) {
        initialStates[item.productId] = {
          capsuleCount:
            item.basePlanPrice?.capsuleCount || selectedPlan.capsuleCount,
          quantity: item.quantity || 1,
        };
      }
    });
    setProductStates(initialStates);
  }, [standUpPouchItems, standUpPouchPlans]);

  useEffect(() => {
    // Set initial selected sachets plan
    const selected = sachetsPlans.find((p) => p.isSelected);
    if (selected) {
      setSelectedSachetsPlan(selected.planKey);
    }
  }, [sachetsPlans]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".capsule-dropdown")) {
        setOpenDropdowns({});
      }
    };

    if (Object.values(openDropdowns).some((isOpen) => isOpen)) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdowns]);

  // Same body shape as POST /checkout/page-summary for quantity / plan updates
  const buildPageSummaryPayload = useCallback(
    (couponOpts?: { couponCode?: string | null }) => {
      const payload: CheckoutPageSummarySelectionsBody = {};

      if (sachetsItems.length > 0) {
        const selectedPlan = sachetsPlans.find(
          (p) => p.planKey === selectedSachetsPlan
        );
        if (selectedPlan) {
          payload.sachets = {
            planDurationDays: selectedPlan.durationDays,
          };
        }
      }

      if (standUpPouchItems.length > 0) {
        payload.standUpPouch = {
          itemQuantities: standUpPouchItems.map((item) => {
            const state = productStates[item.productId];
            const plans = standUpPouchPlans[item.productId] || [];
            const selectedPlan =
              plans.find((plan: { isSelected?: boolean }) => plan.isSelected) ||
              plans[0];
            const capsuleCount =
              state?.capsuleCount ??
              item.basePlanPrice?.capsuleCount ??
              selectedPlan?.capsuleCount ??
              0;
            return {
              capsuleCount,
              productId: item.productId,
              quantity: state?.quantity || item.quantity || 1,
            };
          }),
        };
      }

      let resolvedCoupon: string | undefined;
      if (couponOpts && "couponCode" in couponOpts) {
        const c = couponOpts.couponCode;
        resolvedCoupon =
          c === null || c === "" ? undefined : c;
      } else {
        resolvedCoupon = couponCode || undefined;
      }
      if (resolvedCoupon) {
        payload.couponCode = resolvedCoupon;
      }

      return payload;
    },
    [
      sachetsItems,
      sachetsPlans,
      selectedSachetsPlan,
      standUpPouchItems,
      standUpPouchPlans,
      productStates,
      couponCode,
    ]
  );

  useImperativeHandle(ref, () => ({ buildPageSummaryPayload }), [
    buildPageSummaryPayload,
  ]);

  const handleSachetsPlanSelect = async (planKey: string) => {
    setSelectedSachetsPlan(planKey);
    onPlanSelect?.(planKey);

    const selectedPlan = sachetsPlans.find((p) => p.planKey === planKey);
    if (selectedPlan) {
      try {
        // Build and send full payload
        const payload = buildPageSummaryPayload();
        // Update payload with new sachets plan
        payload.sachets = {
          planDurationDays: selectedPlan.durationDays,
        };

        await updateCheckoutSelections(withQuizCheckoutPayload(payload)).unwrap();
      } catch (error) {
        console.error("Failed to update plan selection:", error);
      }
    }
  };

  const handleCapsuleCountChange = async (
    productId: string,
    capsuleCount: number
  ) => {
    setProductStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], capsuleCount },
    }));
    // Close dropdown after selection
    setOpenDropdowns((prev) => ({ ...prev, [productId]: false }));

    // Send update to API
    try {
      const payload = buildPageSummaryPayload();
      // Update payload with new capsule count for this product
      if (payload.standUpPouch) {
        payload.standUpPouch.itemQuantities =
          payload.standUpPouch.itemQuantities.map((item: any) =>
            item.productId === productId ? { ...item, capsuleCount } : item
          );
      }

      await updateCheckoutSelections(withQuizCheckoutPayload(payload)).unwrap();
    } catch (error) {
      console.error("Failed to update capsule count:", error);
    }
  };

  const toggleDropdown = (productId: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleQuantityChange = async (productId: string, delta: number) => {
    const newQuantity = Math.max(
      1,
      (productStates[productId]?.quantity || 1) + delta
    );

    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newQuantity,
      },
    }));

    // Send update to API
    try {
      const payload = buildPageSummaryPayload();
      // Update payload with new quantity for this product
      if (payload.standUpPouch) {
        payload.standUpPouch.itemQuantities =
          payload.standUpPouch.itemQuantities.map((item: any) =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          );
      }

      await updateCheckoutSelections(withQuizCheckoutPayload(payload)).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleDeleteItem = async (
    productId: string,
    variantType: "SACHETS" | "STAND_UP_POUCH"
  ) => {
    try {
      await removeCartItem({ productId, variantType }).unwrap();

      // Re-call page-summary with payload that excludes the deleted item
      const payload = buildPageSummaryPayload();
      if (payload.standUpPouch) {
        payload.standUpPouch.itemQuantities =
          payload.standUpPouch.itemQuantities.filter(
            (item) => item.productId !== productId
          );
        if (payload.standUpPouch.itemQuantities.length === 0) {
          delete payload.standUpPouch;
        }
      }

      await updateCheckoutSelections(withQuizCheckoutPayload(payload)).unwrap();
      await onRefreshCheckout?.();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  // Get features for sachets plans
  const getFixedFeatures = (durationDays: number): string[] => {
    if (durationDays >= 60) {
      return [tCheckout("freeShipping"), tCheckout("canBeCancelledAnyTime")];
    }
    return [tCheckout("canBeCancelledAnyTime")];
  };

  // Sort sachets plans
  const sortedSachetsPlans = [...sachetsPlans].sort(
    (a, b) => b.durationDays - a.durationDays
  );

  return (
    <div className="relative">
      {isUpdatingPlan && (
        <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="space-y-4">
        {/* Viteezy Sachets accordion */}
        {sachetsPlans.length > 0 && (
          <div className="border border-linen-color rounded-lg bg-white">
            <button
              onClick={() => setSachetsPlansOpen(!sachetsPlansOpen)}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <h3 className="text-base font-medium">
                {tCheckout("viteezySachets")}
              </h3>
              {sachetsPlansOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {sachetsPlansOpen && (
              <div className="px-4 pb-4 space-y-3">
                {sortedSachetsPlans.map((plan) => (
                  <div
                    key={plan.planKey}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSachetsPlan === plan.planKey
                        ? "border-black bg-white"
                        : "border-linen-color"
                    }`}
                    onClick={() => handleSachetsPlanSelect(plan.planKey)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between">
                          <div className="flex items-center gap-3">
                            <div className="min-w-5 h-5 rounded-full border border-black flex items-center justify-center">
                              {selectedSachetsPlan === plan.planKey && (
                                <div className="w-3 h-3 rounded-full bg-black" />
                              )}
                            </div>
                            <div className="flex flex-row items-center gap-3">
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">
                                  {plan.durationDays === 1
                                    ? tAccount("subscriptionOneDayPlan", {
                                        days: 1,
                                      })
                                    : tAccount("subscriptionManyDaysPlan", {
                                        days: plan.durationDays,
                                      })}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {tCheckout("capsulesCount", {
                                    count: plan.capsuleCount,
                                  })}
                                </p>
                              </div>
                              {plan.savePercentage > 0 && (
                                <span className="bg-pastel-yellow-color text-xs font-medium px-3 py-1 rounded-sm">
                                  {tCheckout("savePercentage", {
                                    percentage: plan.savePercentage,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="sm:text-right bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-md sm:rounded-none">
                            <span className="text-xl font-semibold text-gray-900">
                              {getCurrencySymbol(
                                plan.currency ||
                                  sachetsItems[0]?.basePlanPrice?.currency,
                              )}
                              {plan.perMonthAmount.toFixed(2)}{" "}
                              <span className="text-gray-600 font-normal text-sm">
                                {tCheckout("perMonth")}
                              </span>
                            </span>
                            <p className="text-sm text-gray-600">
                              {tCheckout("perDeliveryEveryDays", {
                                amount: `${getCurrencySymbol(
                                  plan.currency ||
                                    sachetsItems[0]?.basePlanPrice?.currency,
                                )}${plan.perDeliveryAmount.toFixed(2)}`,
                                days: plan.durationDays,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mt-2.5 sm:mt-4">
                          {getFixedFeatures(plan.durationDays).map(
                            (feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <CircleCheck
                                  className="h-5 w-5 text-black shrink-0"
                                  strokeWidth={1.7}
                                />
                                <span className="text-sm">{feature}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stand-up pouch accordion */}
        {standUpPouchItems.length > 0 && (
          <div className="border border-linen-color rounded-lg bg-white relative">
            {isDeletingItem && <Loading zIndex={15} size="md" />}
            <button
              onClick={() => setStandUpPouchOpen(!standUpPouchOpen)}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <h3 className="text-base font-medium ">
                {tCheckout("standUpPouch")}
              </h3>
              {standUpPouchOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {standUpPouchOpen && (
              <div className="px-4 pb-4 space-y-4">
                {standUpPouchItems.map((item) => {
                  const productPlans = standUpPouchPlans[item.productId] || [];
                  const selectedPlan =
                    productPlans.find((plan) => plan.isSelected) ||
                    productPlans[0];
                  const defaultCapsuleCount =
                    selectedPlan?.capsuleCount ||
                    item.basePlanPrice?.capsuleCount;
                  const state = productStates[item.productId] || {
                    capsuleCount: defaultCapsuleCount,
                    quantity: item.quantity || 1,
                  };

                  return (
                    <div
                      key={item.productId}
                      className="rounded-lg bg-white border border-linen-color"
                    >
                      <div className="p-4">
                        {/* Header with image and title */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={item.image || "/carosuleCardImage.png"}
                                alt={item.title || tCart("product")}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                // unoptimized
                              />
                            </div>
                            <div>
                              <h4 className="text-base font-medium text-gray-900 line-clamp-1">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {tCheckout("capsulesCount", {
                                  count: state.capsuleCount,
                                })}{" "}
                                • x{state.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              {getCurrencySymbol(item.basePlanPrice.currency)}
                              {selectedPlan?.discountedPrice?.toFixed(2)}
                            </span>
                            {selectedPlan?.discountedPrice <
                              selectedPlan?.totalAmount && (
                              <p className="text-sm text-gray-500 line-through">
                                {getCurrencySymbol(item.basePlanPrice.currency)}
                                {selectedPlan?.totalAmount?.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Capsule count dropdown and Quantity controls in same row */}
                        <div className="sm:flex items-center gap-3">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              {tCheckout("capsulesOptions")}
                            </label>
                            <div className="relative capsule-dropdown">
                              <button
                                type="button"
                                onClick={() => toggleDropdown(item.productId)}
                                className="text-sm sm:text-base w-full px-4 py-2 border border-linen-color rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-left flex items-center justify-between"
                              >
                                <span>
                                  {tCheckout("capsulesCount", {
                                    count: state.capsuleCount,
                                  })}
                                </span>
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    openDropdowns[item.productId]
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </button>

                              {openDropdowns[item.productId] && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-black rounded-md shadow-lg z-100">
                                  {productPlans.map((plan: any) => (
                                    <div
                                      key={plan.planKey}
                                      onClick={() =>
                                        handleCapsuleCountChange(
                                          item.productId,
                                          plan.capsuleCount
                                        )
                                      }
                                      className={`px-3 py-2 text-sm cursor-pointer flex items-center m-2 justify-between hover:bg-neutral-50 ${
                                        state.capsuleCount === plan.capsuleCount
                                          ? "bg-[#FDFBF7]"
                                          : ""
                                      }`}
                                    >
                                      <span>
                                        {tCheckout("capsulesCount", {
                                          count: plan.capsuleCount,
                                        })}
                                      </span>
                                      {state.capsuleCount ===
                                        plan.capsuleCount && (
                                        <CircleCheck className="w-4 h-4" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3 sm:mt-7">
                            {state.quantity === 1 ? (
                              <div className="flex items-center border border-linen-color rounded-md h-9.5 sm:h-10 w-full sm:w-fit shrink-0">
                                <button
                                  onClick={() =>
                                    handleDeleteItem(item.productId, item.variantType || "STAND_UP_POUCH")
                                  }
                                  className="min-w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-md transition-colors text-charcol-color border-r border-linen-color cursor-pointer"
                                >
                                  <TrashIcon />
                                </button>
                                <span className="text-base font-medium w-full sm:w-9 text-center">
                                  {state.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item.productId, 1)
                                  }
                                  className="min-w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-md transition-colors text-charcol-color border-l border-linen-color cursor-pointer"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center border border-linen-color rounded-md h-9.5 sm:h-10 w-full sm:w-fit shrink-0">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item.productId, -1)
                                  }
                                  className="min-w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-md transition-colors text-charcol-color border-r border-linen-color cursor-pointer"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-base font-medium w-full sm:w-9 text-center">
                                  {state.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item.productId, 1)
                                  }
                                  className="min-w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-md transition-colors text-charcol-color border-l border-linen-color cursor-pointer"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Membership discount banner */}
                      {item.membershipDiscount > 0 && (
                        <div className="bg-linear-to-r from-[#1baf9965] to-[#f7a1736f] px-4 py-2 flex justify-between rounded-b-lg">
                          <span className="text-sm font-medium">
                            {tCheckout("membershipDiscount")}
                          </span>
                          <span className="text-sm font-semibold">
                            -{getCurrencySymbol(item.basePlanPrice.currency)}
                            {item.membershipDiscount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default PackagingOptions;
