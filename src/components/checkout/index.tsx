"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ContactInformation from "./ContactInformation";
import ShippingAddress from "./ShippingAddress";
import OrderSummary from "./OrderSummary";
import PackagingOptions, {
  type PackagingOptionsHandle,
} from "./PackagingOptions";
import DiscountCode from "./DiscountCode";
import AddToOrder from "./AddToOrder";
import SummaryPricing from "./SummaryPricing";
import UserAddresses from "./UserAddresses";
import CheckoutPolicies from "./CheckoutPolicies";
import CheckoutFor from "./CheckoutFor";
import Loading from "@/components/ui/loading";
import {
  useGetCheckoutPageSummaryQuery,
  useGetQuizCheckoutPageSummaryQuery,
  useValidateCartMutation,
  useGetCartQuery,
  useGetQuizRecommendationCartQuery,
  useUpdateCheckoutSelectionsMutation,
} from "@/store";
import { useGetAddressesQuery } from "@/store/api/addressApi";
import MainLayout from "../layouts/MainLayout";
import { useTranslations } from "next-intl";
import {
  clearQuizCheckoutInitializedFlag,
  clearQuizCheckoutSession,
  isQuizCheckoutSessionActive,
  QUIZ_CART_QUERY_PLACEHOLDER,
  QUIZ_PAGE_SUMMARY_QUERY_PLACEHOLDER,
  readQuizCheckoutContext,
  toQuizCartParams,
  toQuizPageSummaryBody,
  type QuizCheckoutContext,
} from "@/components/recommendations/quizCheckoutStorage";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <MainLayout
    simpleHeader
    headerClassName="border-b border-slate-border-color bg-white"
  >
    {children}
  </MainLayout>
);

const Checkout: React.FC = () => {
  const tCheckout = useTranslations("Checkout");
  const [quizCheckoutContext] = useState<QuizCheckoutContext | null>(() =>
    readQuizCheckoutContext()
  );
  const isQuizCheckout = quizCheckoutContext !== null;

  const quizPageSummaryArgs = useMemo(
    () =>
      quizCheckoutContext
        ? toQuizPageSummaryBody(quizCheckoutContext)
        : QUIZ_PAGE_SUMMARY_QUERY_PLACEHOLDER,
    [quizCheckoutContext]
  );

  const quizCartParams = useMemo(
    () =>
      quizCheckoutContext
        ? toQuizCartParams(quizCheckoutContext)
        : QUIZ_CART_QUERY_PLACEHOLDER,
    [quizCheckoutContext]
  );

  const quizPageSummaryBody = quizCheckoutContext
    ? toQuizPageSummaryBody(quizCheckoutContext)
    : undefined;

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isPaymentRedirecting, setIsPaymentRedirecting] = useState(false);

  const {
    data,
    isLoading,
    refetch: refetchAddresses,
  } = useGetAddressesQuery(
    selectedMemberId ? { subMemberId: selectedMemberId } : undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const addresses = data?.data?.addresses || [];
  const hasAddresses = addresses.length > 0;

  const [selectedPlanKey, setSelectedPlanKey] = useState<string>("");

  const router = useRouter();

  const {
    data: normalCheckoutData,
    isLoading: normalCheckoutLoading,
    error: normalCheckoutError,
    refetch: refetchCheckout,
    isFetching: isNormalCheckoutFetching,
  } = useGetCheckoutPageSummaryQuery(undefined, {
    skip: isQuizCheckout,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: quizCheckoutData,
    isLoading: quizCheckoutLoading,
    error: quizCheckoutError,
    isFetching: isQuizCheckoutFetching,
    refetch: refetchQuizCheckout,
  } = useGetQuizCheckoutPageSummaryQuery(quizPageSummaryArgs, {
    skip: !isQuizCheckout,
    refetchOnMountOrArgChange: false,
  });

  const checkoutData = isQuizCheckout ? quizCheckoutData : normalCheckoutData;
  const checkoutLoading = isQuizCheckout
    ? quizCheckoutLoading
    : normalCheckoutLoading;
  const error = isQuizCheckout ? quizCheckoutError : normalCheckoutError;
  const isFetching = isQuizCheckout
    ? isQuizCheckoutFetching
    : isNormalCheckoutFetching;

  const [validateCart, { isLoading: isValidating }] = useValidateCartMutation();
  const [updateCheckoutSelections] = useUpdateCheckoutSelectionsMutation();
  const packagingOptionsRef = useRef<PackagingOptionsHandle>(null);

  const {
    data: normalCartData,
    refetch: refetchNormalCart,
    isSuccess: isNormalCartSuccess,
  } = useGetCartQuery(undefined, {
    skip: isQuizCheckout,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: quizCartData,
    isSuccess: isQuizCartSuccess,
    isLoading: isQuizCartLoading,
    refetch: refetchQuizCart,
  } = useGetQuizRecommendationCartQuery(quizCartParams, {
    skip: !isQuizCheckout,
    refetchOnMountOrArgChange: true,
  });

  const cartData = isQuizCheckout ? quizCartData : normalCartData;
  const isCartSuccess = isQuizCheckout ? isQuizCartSuccess : isNormalCartSuccess;
  const isCartLoading = isQuizCheckout ? isQuizCartLoading : false;

  const cartId =
    checkoutData?.data?.cart?.cartId ||
    cartData?.data?.cart?._id ||
    quizCheckoutContext?.cartId ||
    "";
  const cartApiItems = cartData?.data?.cart?.items || [];

  const cartItems = checkoutData?.data?.cart?.items || [];
  const sachetsPlans = checkoutData?.data?.sachetsPlans || [];
  const standUpPouchPlans = checkoutData?.data?.standUpPouchPlans || {};
  const pricing = checkoutData?.data?.pricing?.overall;
  const suggestedProducts = checkoutData?.data?.suggestedProducts || [];
  const coupon = checkoutData?.data?.coupon || null;
  const couponPresentButInvalid =
    coupon != null && coupon.isValid !== true;
  const activeCouponCode = couponPresentButInvalid
    ? undefined
    : (coupon?.code || cartData?.data?.cart?.couponCode || undefined);

  const displayPricing =
    pricing && couponPresentButInvalid
      ? { ...pricing, couponDiscountAmount: 0 }
      : pricing;

  const sachetsItems = cartItems.filter((item) => item.variant === "SACHETS");
  const standUpPouchItems = cartItems.filter(
    (item) => item.variant === "STAND_UP_POUCH"
  );

  const withQuizCheckoutPayload = <T extends Record<string, unknown>>(
    payload: T
  ) =>
    isQuizCheckout && quizCheckoutContext
      ? {
          ...payload,
          cartId: quizCheckoutContext.cartId,
          cartType: quizCheckoutContext.cartType,
        }
      : payload;

  const handleRefreshCheckout = async () => {
    if (isQuizCheckout) {
      await refetchQuizCheckout();
      await refetchQuizCart();
      return;
    }

    await refetchCheckout();
    await refetchNormalCart();
  };

  const handleCheckoutSummaryAfterCoupon = async (opts?: {
    appliedCode?: string;
    removed?: boolean;
  }) => {
    try {
      const couponOpts: { couponCode?: string | null } | undefined =
        opts?.removed === true
          ? { couponCode: null }
          : opts?.appliedCode !== undefined
            ? { couponCode: opts.appliedCode }
            : undefined;
      const payload =
        packagingOptionsRef.current?.buildPageSummaryPayload(couponOpts) ??
        {};

      if (Object.keys(payload).length > 0) {
        await updateCheckoutSelections(
          withQuizCheckoutPayload(payload)
        ).unwrap();
      } else if (!isQuizCheckout) {
        await refetchCheckout();
      }

      if (!isQuizCheckout) {
        await refetchNormalCart();
      }
    } catch (error) {
      console.error("Failed to refresh checkout summary:", error);
    }
  };

  useEffect(() => {
    if (isQuizCheckoutSessionActive() && !quizCheckoutContext) {
      clearQuizCheckoutSession();
    }
  }, [quizCheckoutContext]);

  useEffect(() => {
    return () => {
      clearQuizCheckoutSession();
    };
  }, []);

  useEffect(() => {
    if (isQuizCheckout) {
      if (
        !checkoutLoading &&
        checkoutData?.data &&
        cartItems.length === 0 &&
        isCartSuccess &&
        cartApiItems.length === 0 &&
        !isPaymentRedirecting
      ) {
        router.replace("/products");
      }
      return;
    }

    if (
      isCartSuccess &&
      cartApiItems.length === 0 &&
      !isPaymentRedirecting
    ) {
      router.replace("/products");
    }
  }, [
    isQuizCheckout,
    isCartSuccess,
    cartApiItems.length,
    checkoutLoading,
    checkoutData?.data,
    cartItems.length,
    router,
    isPaymentRedirecting,
  ]);

  useEffect(() => {
    if (isQuizCheckout) {
      clearQuizCheckoutInitializedFlag();
      refetchAddresses();
      return;
    }

    refetchCheckout();
    refetchNormalCart();
    refetchAddresses();
  }, [
    isQuizCheckout,
    refetchCheckout,
    refetchNormalCart,
    refetchAddresses,
  ]);

  useEffect(() => {
    if (!isQuizCheckout && cartItems.length > 0) {
      validateCart();
    }
  }, [isQuizCheckout, cartItems.length, validateCart]);

  if (isLoading || checkoutLoading || isCartLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-off-white-color flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-600">{tCheckout("loadingCheckout")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !checkoutData?.data) {
    return (
      <Layout>
        <div className="min-h-screen bg-off-white-color flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">
              {tCheckout("failedToLoadCart")}
            </p>
            <button
              onClick={() => router.push("/products")}
              className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800"
            >
              {tCheckout("continueShopping")}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen checkout bg-off-white-color border-t border-neutral-sand-100 relative z-0">
        {isFetching && <Loading zIndex={99} className=""/>}
        <div className="max-w-3xl lg:max-w-[1220px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-0">
            <div className="space-y-7 address z-10 pt-10 pe-0 lg:pe-10 ps-0 lg:pb-10 relative lg:self-start h-full order-2 lg:order-1">
              <div className="address-pin h-fit space-y-7 lg:sticky lg:top-40">
                <ContactInformation />

                <CheckoutFor
                  onMemberSelect={setSelectedMemberId}
                  selectedMemberId={selectedMemberId}
                />

                {checkoutLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
                  </div>
                ) : hasAddresses ? (
                  <UserAddresses
                    checkoutData={checkoutData?.data}
                    selectedPlanKey={selectedPlanKey}
                    isCheckoutLoading={checkoutLoading}
                    isValidating={isValidating}
                    selectedMemberId={selectedMemberId}
                    isQuizCheckout={isQuizCheckout}
                    quizCartParams={
                      isQuizCheckout ? quizCartParams : undefined
                    }
                    onPaymentRedirectStart={() => setIsPaymentRedirecting(true)}
                    onPaymentRedirectEnd={() => setIsPaymentRedirecting(false)}
                  />
                ) : (
                  <ShippingAddress
                    isCheckoutLoading={checkoutLoading}
                    isValidating={isValidating}
                  />
                )}

                <CheckoutPolicies />
              </div>
              <div className="absolute hidden lg:block h-full w-screen top-0 end-0 bg-white -z-10 border-e border-slate-border-color"></div>
            </div>

            <div className="checkout-right space-y-7  mb-0 mt-7 lg:mb-10 lg:mt-10 lg:ps-10 order-1 lg:order-2">
              <OrderSummary items={sachetsItems} />
              <PackagingOptions
                ref={packagingOptionsRef}
                sachetsItems={sachetsItems}
                standUpPouchItems={standUpPouchItems}
                sachetsPlans={sachetsPlans}
                standUpPouchPlans={standUpPouchPlans}
                onPlanSelect={(planKey) => setSelectedPlanKey(planKey)}
                couponCode={activeCouponCode}
                quizCheckoutContext={quizPageSummaryBody}
                onRefreshCheckout={handleRefreshCheckout}
              />
              <DiscountCode
                coupon={coupon}
                cartId={cartId}
                onRefreshCart={handleCheckoutSummaryAfterCoupon}
              />
              {displayPricing && (
                <SummaryPricing pricing={displayPricing} isValidating={isValidating} />
              )}
              <AddToOrder
                suggestedProducts={suggestedProducts}
                currency={displayPricing?.currency}
                isQuizCheckout={isQuizCheckout}
                quizCartParams={
                  isQuizCheckout ? quizCartParams : undefined
                }
                onRefreshCheckout={handleRefreshCheckout}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
