"use client";

import { Order } from "@/components/types/account";
import { getCurrencySymbol } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { memo, useState, useEffect } from "react";
import FallbackImage from "@/components/ui/fallbackImage";
import PortalDialog from "@/components/ui/portalDialog";
import { useLazyGetOrderByIdQuery, usePayAgainMutation } from "@/store";
import ReviewDialog from "./ReviewDialog";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Spinner from "@/components/ui/spinner";
import PaymentStatusBadge from "../PaymentStatusBadge";

interface OrderItemCardProps {
  order: Order;
  item: Order["items"][0];
  index: number;
}

const OrderCard: React.FC<OrderItemCardProps> = ({ order, item, index }) => {
  const t = useTranslations("Account");
  const tConfirmed = useTranslations("OrderConfirmed");
  const tCart = useTranslations("Cart");
  const tCommon = useTranslations("Common");
  const tCheckout = useTranslations("Checkout");
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [getOrderById, { data: orderData, isLoading, error }] =
    useLazyGetOrderByIdQuery();
  const [payAgain, { isLoading: isPaying }] = usePayAgainMutation();
  const isFirstItem = index == 0;
  const showPayNow = order.canPayAgain === true;
  console.log(orderData);
  const longDate = (d: string | Date) =>
    new Date(d).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const toAmount = (value: unknown): number =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  // Payment method details may not be present depending on API shape.
  const paymentMethodDetails = (orderData as any)?.data?.order?.paymentMethod;
  const cardBrandLabel =
    paymentMethodDetails?.brand ||
    paymentMethodDetails?.cardBrand ||
    paymentMethodDetails?.provider ||
    tCommon("notApplicable");

  const rawLast4 =
    paymentMethodDetails?.last4 ||
    paymentMethodDetails?.cardLast4 ||
    paymentMethodDetails?.lastDigits;

  const normalizedLast4 =
    typeof rawLast4 === "string"
      ? rawLast4.replace(/[^0-9]/g, "").slice(-4)
      : typeof rawLast4 === "number"
      ? String(rawLast4).slice(-4)
      : null;

  const maskedCardLabel = normalizedLast4
    ? tCommon("cardMask", { last4: normalizedLast4 })
    : tCommon("notApplicable");

  const handleViewOrder = () => {
    console.log("=== VIEW ORDER CLICKED ===");
    console.log("Order ID:", order.id);
    setIsDialogOpen(true);

    // Fetch order details
    getOrderById(order.id);
  };

  const handlePayNow = async () => {
    if (!order.id || isPaying) return;

    const origin = window.location.origin;

    try {
      const paymentResponse = await payAgain({
        orderId: order.id,
        paymentMethod: order.paymentMethod || "Stripe",
        returnUrl: `${origin}/orderConfirmed/success?orderId=${order.id}`,
        cancelUrl: `${origin}/orderConfirmed/failed`,
      }).unwrap();

      if (!paymentResponse.success) {
        toast.error(
          paymentResponse.message || tCheckout("failedToCreatePayment")
        );
        return;
      }

      const redirectUrl = paymentResponse.data?.gateway?.redirectUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      toast.error(tCheckout("failedToCreatePayment"));
    } catch (paymentError: any) {
      toast.error(
        paymentError?.data?.message || tCheckout("failedToCreatePayment")
      );
    }
  };

  useEffect(() => {
    if (orderData) {
      console.log("=== ORDER DETAILS API RESPONSE ===");
      console.log("Full Response:", orderData);
      console.log("Order Data:", orderData.data);
      if (orderData.data?.order) {
        console.log("Order Number:", orderData.data.order.orderNumber);
        console.log(
          "Total:",
          orderData.data.order.pricing?.grandTotal,
          orderData.data.order.pricing?.currency
        );
        console.log("Status:", orderData.data.order.status);
        console.log("Items:", orderData.data.order.items);
      }
    }
    if (error) {
      console.error("=== ORDER DETAILS API ERROR ===", error);
    }
  }, [orderData, error]);

  return (
    <div>
      <div className="mb-4">
        {order.status === "delivered" && (
          <div className="mb-2">
            <p className="text-gray-900 font-medium text-xl">
              {order.deliveryDate}
            </p>
            {order.deliveryNote && (
              <p className="text-gray-400 text-base font-medium">
                {order.deliveryNote}
              </p>
            )}
          </div>
        )}
        {(order.status === "active" || order.status === "pending") && (
          <p className="text-gray-900 font-medium text-xl">
            {order.deliveryDate}
          </p>
        )}
      </div>

      <div className="flex flex-row flex-wrap items-center gap-4 bg-white rounded-lg">
        {/* Product Image */}
        <div className="shrink-0">
          <div className="w-25 h-25 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 overflow-hidden">
            <FallbackImage
              src={item?.image}
              alt={item.name}
              width={220}
              height={180}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium text-xl mb-0 max-w-150 line-clamp-1 wrap-break-word break-all">
            {item.name}
          </h3>
          <p className="text-gray-400 text-[17px]">{item.quantity}</p>
        </div>

        {/* Action Buttons */}
        {isFirstItem && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              className="text-base h-11! px-7 hover:rounded-lg"
              variant="elevate"
              size="elevate"
              animateText
              onClick={handleViewOrder}
            >
              {t("viewOrder")}
            </Button>
            {showPayNow && (
              <Button
                className="text-base h-11! px-7 hover:rounded-lg min-w-[120px]"
                variant="tealElevate"
                size="elevate"
                animateText={!isPaying}
                onClick={handlePayNow}
                disabled={isPaying}
              >
                {isPaying ? (
                  <Spinner size="xs" color="white" />
                ) : (
                  tCheckout("payNow")
                )}
              </Button>
            )}
            {order.status === "delivered" && (
              <>
                <Button
                  className="text-base h-11! px-7 hover:rounded-lg"
                  variant="tealElevate"
                  size="elevate"
                  animateText
                  onClick={() => setIsReviewDialogOpen(true)}
                >
                  {t("writeReview")}
                </Button>
                <Button
                  className="text-base h-11! px-7 hover:rounded-lg"
                  variant="elevate"
                  size="elevate"
                  animateText
                >
                  {t("buyItAgain")}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <PortalDialog
        isShow={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        width={850}
        showCloseButton={true}
        bodyClass="p-8 md:px-10 md:py-8"
        contentClass="mt-0"
      >
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">{t("loadingOrderDetails")}</p>
          </div>
        ) : orderData?.data?.order ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl 4xl:text-3xl font-medium text-gray-900">
                {t("orderDetails")}
              </h2>
              <p className="text-base text-charcol-gray">
                {t("orderDetailsIntro", {
                  orderNumber: orderData.data.order.orderNumber,
                  date: longDate(orderData.data.order.createdAt),
                })}
              </p>
            </div>

            {/* Payment, Address, Delivery Method Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-y border-warm-beige/40">
              {/* Payment Status */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("paymentStatusLabel")}
                </h3>
                <PaymentStatusBadge
                  status={
                    orderData.data.order.paymentStatus || order.paymentStatus
                  }
                />
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderPaymentMethod")}
                </h3>
                <div className="flex items-center gap-2">
                  {orderData.data.order.paymentMethod === "Stripe" && (
                    <>
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs 3xl:text-sm font-bold">
                        {tConfirmed("paymentCardBadge")}
                      </div>
                      <span className="text-charcol-gray text-sm 4xl:text-base">
                        **** **** **** ****
                      </span>
                    </>
                  )}
                  {orderData.data.order.paymentMethod !== "Stripe" && (
                    <span className="text-charcol-gray text-sm 4xl:text-base">
                      {orderData.data.order.paymentMethod || t("notAvailable")}
                    </span>
                  )}
                </div>
              </div>

              {/* Address - Dynamic */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderAddressLabel")}
                </h3>
                <div className="text-charcol-gray text-sm 4xl:text-base">
                  {orderData.data.order.shippingAddressId ? (
                    <>
                      <p>
                        {orderData.data.order.shippingAddressId.firstName}{" "}
                        {orderData.data.order.shippingAddressId.lastName}
                      </p>
                      <p>
                        {orderData.data.order.shippingAddressId.streetName}{" "}
                        {orderData.data.order.shippingAddressId.houseNumber}
                        {orderData.data.order.shippingAddressId
                          .houseNumberAddition
                          ? `, ${orderData.data.order.shippingAddressId.houseNumberAddition}`
                          : ""}
                      </p>
                      {orderData.data.order.shippingAddressId.address && (
                        <p>{orderData.data.order.shippingAddressId.address}</p>
                      )}
                      <p>
                        {orderData.data.order.shippingAddressId.city},{" "}
                        {orderData.data.order.shippingAddressId.country}
                      </p>
                      <p>{orderData.data.order.shippingAddressId.postalCode}</p>
                      {orderData.data.order.shippingAddressId.phone && (
                        <p>
                          {t("phoneWithColon")}{" "}
                          {orderData.data.order.shippingAddressId.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>{t("noAddressAvailable")}</p>
                  )}
                </div>
              </div>

              {/* Delivery Method - Static */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderDeliveryMethod")}
                </h3>
                {/* <p className="text-charcol-gray text-sm 4xl:text-base">
                  {t("expressShippingDays")}
                </p> */}
                <p className="text-charcol-gray text-sm 4xl:text-base">
                  {orderData.data.order.planType === "Subscription"
                    ? tConfirmed("subscriptionDelivery")
                    : tConfirmed("standardShipping")}
                  {orderData.data.order.items?.[0]?.features?.includes(
                    "Free shipping"
                  )
                    ? ` (${tConfirmed("free")})`
                    : ""}
                </p>
              </div>
            </div>

            {/* Price Summary - Dynamic */}
            <div className="md:flex">
              <div className="md:flex-[0.5]"></div>
              <div className="md:flex-[0.5] space-y-2">
                {(() => {
                  const pricing = orderData.data.order.pricing as any;
                  const overall = pricing?.overall ?? {};
                  const currency = overall.currency ?? order.currency;
                  const subTotal = toAmount(overall.subTotal);
                  const discountedPrice = toAmount(overall.discountedPrice);
                  const membershipDiscountAmount = toAmount(
                    overall.membershipDiscountAmount
                  );
                  const couponDiscountAmount = toAmount(
                    overall.couponDiscountAmount
                  );
                  const subscriptionPlanDiscountAmount = toAmount(
                    overall.subscriptionPlanDiscountAmount
                  );
                  const taxAmount = toAmount(overall.taxAmount);
                  const grandTotal = toAmount(overall.grandTotal);

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-charcol-color text-sm 4xl:text-base">
                          {tCart("subtotal")}
                        </span>
                        <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                          {getCurrencySymbol(currency)}
                          {subTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcol-color text-sm 4xl:text-base">
                          {tCart("shipping")}
                        </span>
                        <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                          {tCommon("free")}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center">
                        <span className="text-charcol-color text-sm 4xl:text-base">
                          {tCheckout("discountedPrice")}
                        </span>
                        <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                          {getCurrencySymbol(currency)}
                          {discountedPrice.toFixed(2)}
                        </span>
                      </div> */}
                      {discountedPrice && discountedPrice < subTotal && (
                        <div className="flex justify-between items-center">
                          <span className="text-charcol-color text-sm 4xl:text-base">
                            {tCheckout("discountedPrice")}
                          </span>
                          <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                            - {getCurrencySymbol(currency)}
                            {(subTotal - discountedPrice)?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {membershipDiscountAmount > 0 && (
                        <div className="flex justify-between items-center pb-4">
                          <span className="text-charcol-color text-sm 4xl:text-base">
                            {t("orderMembershipDiscount")}
                          </span>
                          <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                            - {getCurrencySymbol(currency)}
                            {membershipDiscountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {couponDiscountAmount > 0 && (
                        <div className="flex justify-between items-center pb-4">
                          <span className="text-charcol-color text-sm 4xl:text-base">
                            {t("orderCouponDiscount")}
                          </span>
                          <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                            - {getCurrencySymbol(currency)}
                            {couponDiscountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {subscriptionPlanDiscountAmount > 0 && (
                        <div className="flex justify-between items-center pb-4">
                          <span className="text-charcol-color text-sm 4xl:text-base">
                            {t("orderSubscriptionDiscount")}
                          </span>
                          <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                            - {getCurrencySymbol(currency)}
                            {subscriptionPlanDiscountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {taxAmount > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-charcol-color text-sm 4xl:text-base">
                            {tCart("tax")}
                          </span>
                          <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                            {getCurrencySymbol(currency)}
                            {taxAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t border-warm-beige/40">
                        <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                          {tCart("total")}
                        </span>
                        <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                          {getCurrencySymbol(currency)}
                          {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Fallback to order prop data when API data not available */}
            <div className="space-y-1">
              <h2 className="text-2xl 4xl:text-3xl font-medium text-gray-900">
                {t("orderDetails")}
              </h2>
              <p className="text-base text-charcol-gray">
                {t("orderDetailsIntro", {
                  orderNumber: order.orderNumber,
                  date: order.orderDate,
                })}
              </p>
            </div>

            {/* Payment, Address, Delivery Method Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-y border-warm-beige/40">
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("paymentStatusLabel")}
                </h3>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>

              {/* Payment Method - Static */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderPaymentMethod")}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                    {cardBrandLabel}
                  </div>
                  <span className="text-charcol-gray text-sm 4xl:text-base">
                    {maskedCardLabel}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderAddressLabel")}
                </h3>
                <div className="text-charcol-gray text-sm 4xl:text-base">
                  <p>{t("addressNotAvailable")}</p>
                </div>
              </div>

              {/* Delivery Method - Static */}
              <div>
                <h3 className="text-base font-medium text-charcol-color mb-3">
                  {t("orderDeliveryMethod")}
                </h3>
                <p className="text-charcol-gray text-sm 4xl:text-base">
                  {t("expressShippingDays")}
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="md:flex">
              <div className="md:flex-[0.5]"></div>
              <div className="md:flex-[0.5] space-y-2">
                <div className="flex justify-between items-center pt-4 border-t border-warm-beige/40">
                  <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                    {tCart("total")}
                  </span>
                  <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                    {getCurrencySymbol(
                      order?.pricing?.overall?.currency || order.currency
                    )}
                    {toAmount(
                      order?.pricing?.overall?.grandTotal || order.total
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </PortalDialog>

      {/* Review Dialog */}
      <ReviewDialog
        isShow={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        product={{
          id: item.id,
          name: item.name,
          description: item.quantity,
          image: "/carosuleCardImage.png",
        }}
      />
    </div>
  );
};

export default memo(OrderCard);
