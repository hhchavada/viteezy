import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { SlateCallIcon, SlateEmailIcon } from "../icons";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { getCurrencySymbol } from "@/lib/utils";

interface OrderDetailsSectionProps {
  orderData?: any;
}

export default function OrderDetailsSection({
  orderData,
}: OrderDetailsSectionProps) {
  if (!orderData) {
    return null;
  }

  const locale = useLocale();
  const t = useTranslations("OrderConfirmed");
  const { data: generalSettings } = useGeneralSettings(locale);
  const supportEmail = generalSettings?.supportEmail || "";
  const supportPhone = generalSettings?.supportPhone || "";
  const supportPhoneHref = supportPhone
    ? `tel:${supportPhone.replace(/\s+/g, "")}`
    : "";

  const orderItems = orderData.items || [];
  const pricing = orderData.pricing || {};
  const shippingAddress = orderData.shippingAddressId || {};

  const standupPouchQuantitiesMap: Record<string, number> = {};
  const standupItemQuantities =
    orderData.metadata?.planDetails?.standUpPouch?.itemQuantities;
  if (Array.isArray(standupItemQuantities)) {
    for (const q of standupItemQuantities) {
      if (q?.productId && typeof q.quantity === "number") {
        standupPouchQuantitiesMap[q.productId] = q.quantity;
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale || "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  return (
    <div className="pt-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl 3xl:max-w-[1100px] mx-auto">
        {/* Order Details Header */}
        <div className="bg-teal-green-color rounded-2xl 3xl:rounded-3xl border">
          <div className="px-6 py-4 3xl:py-6 text-white ">
            <h1 className="mb-3 lg:mb-0 text-lg 3xl:text-[21px] font-medium ">
              {t("orderDetails")}
            </h1>
            <div className="flex flex-wrap gap-2 lg:gap-4 text-sm 3xl:text-[17px]">
              <span className="font-light">
                {t("orderNumber")}:{" "}
                <span className="font-medium">
                  {orderData.orderNumber || t("notAvailable")}
                </span>
              </span>
              <span className="text-white/80">|</span>
              <span className="font-light">
                {t("orderDate")}:{" "}
                <span className="font-medium">
                  {orderData.createdAt
                    ? formatDate(orderData.createdAt)
                    : t("notAvailable")}
                </span>
              </span>
              <span className="text-white/80">|</span>
              <span className="font-light">
                {t("estimatedDelivery")}:{" "}
                <span className="font-medium">
                  {orderData.deliveredAt
                    ? formatDate(orderData.deliveredAt)
                    : orderData.metadata?.planDetails?.planDurationDays
                    ? formatDate(
                        new Date(
                          new Date(orderData.createdAt).getTime() +
                            orderData.metadata.planDetails.planDurationDays *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toISOString()
                      )
                    : t("toBeConfirmed")}
                </span>
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl 3xl:rounded-3xl px-6 py-6">
            {/* Items Ordered Section */}
            <div className="mb-8">
              <h2 className="text-lg 4xl:text-xl font-semibold mb-6">
                {t("itemsOrdered")}
              </h2>

              {orderItems.map((item: any, index: number) => (
                <div
                  key={item._id || index}
                  className={`flex items-center justify-between ${
                    index < orderItems.length - 1 ? "mb-6" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className=" bg-white flex items-center justify-center rounded-md 3xl:rounded-lg">
                      <Image
                        src={
                          item.productId?.productImage ||
                          "/products/pro_detail0.png"
                        }
                        alt={item.productId?.title || t("product")}
                        width={60}
                        height={60}
                        className="object-cover rounded-md 3xl:rounded-lg w-14 h-14 3xl:w-17.5 3xl:h-17.5"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-base 3xl:text-lg">
                        {item.productId?.title || item.name || t("product")}
                      </h3>
                      <p className="text-sm 3xl:text-base text-medium-gray">
                        {t("capsulesCount", { count: item.capsuleCount })}
                        {item.productId?._id &&
                          standupPouchQuantitiesMap[item.productId._id] && (
                            <span className="ml-2 inline-flex items-center rounded-sm bg-soft-gray px-1.5 py-px text-sm text-charcol-gray">
                              x{standupPouchQuantitiesMap[item.productId._id]}
                            </span>
                          )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-3">
                    {typeof item.amount === "number" &&
                      typeof item.discountedPrice === "number" &&
                      item.amount > item.discountedPrice && (
                        <span className="text-sm text-medium-gray line-through font-medium">
                          {getCurrencySymbol(
                            pricing.overall?.currency ||
                              pricing.sachets?.currency ||
                              pricing.currency
                          )}
                          {item.amount.toFixed(2)}
                        </span>
                      )}
                    <span className="text-lg font-semibold">
                      {getCurrencySymbol(
                        pricing.overall?.currency ||
                          pricing.sachets?.currency ||
                          pricing.currency
                      )}
                      {(
                        item.discountedPrice ??
                        item.totalAmount ??
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Three Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-y border-warm-beige/40">
              {/* Payment Method */}
              <div>
                <h3 className="text-base 3xl:text-lg font-medium text-charcol-color mb-3">
                  {t("paymentMethod")}
                </h3>
                <div className="flex items-center gap-2">
                  {orderData.paymentMethod === "Stripe" && (
                    <>
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs 3xl:text-sm font-bold">
                        {t("paymentCardBadge")}
                      </div>
                      <span className="text-charcol-gray text-sm 4xl:text-base">
                        **** **** **** ****
                      </span>
                    </>
                  )}
                  {orderData.paymentMethod !== "Stripe" && (
                    <span className="text-charcol-gray text-sm 4xl:text-base">
                      {orderData.paymentMethod || t("notAvailable")}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-base 3xl:text-lg font-medium text-charcol-color mb-3">
                  {t("address")}
                </h3>
                <div className="text-charcol-gray text-sm 4xl:text-base">
                  {shippingAddress.firstName || shippingAddress.lastName ? (
                    <p>
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </p>
                  ) : null}
                  {shippingAddress.streetName || shippingAddress.houseNumber ? (
                    <p>
                      {shippingAddress.streetName} {shippingAddress.houseNumber}
                      {shippingAddress.houseNumberAddition
                        ? ` ${shippingAddress.houseNumberAddition}`
                        : ""}
                    </p>
                  ) : null}
                  {shippingAddress.address ? (
                    <p>{shippingAddress.address}</p>
                  ) : null}
                  {shippingAddress.city || shippingAddress.country ? (
                    <p>
                      {shippingAddress.city}, {shippingAddress.country}
                    </p>
                  ) : null}
                  {shippingAddress.postalCode ? (
                    <p>{shippingAddress.postalCode}</p>
                  ) : null}
                  {shippingAddress.phone ? (
                    <p>{t("phone")}: {shippingAddress.phone}</p>
                  ) : null}
                  {!shippingAddress.firstName && !shippingAddress.streetName ? (
                    <p>{t("noAddressAvailable")}</p>
                  ) : null}
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <h3 className="text-base 3xl:text-lg font-medium text-charcol-color mb-3">
                  {t("deliveryMethod")}
                </h3>
                <p className="text-charcol-gray text-sm 4xl:text-base">
                  {orderData.planType === "Subscription"
                    ? t("subscriptionDelivery")
                    : t("standardShipping")}
                  {orderData.items?.[0]?.features?.includes("Free shipping")
                    ? ` (${t("free")})`
                    : ""}
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="md:flex mt-5 gap-10">
              <div className="md:flex-[0.5] flex flex-col">
                <span className="text-charcol-color text-sm 3xl:text-lg font-medium mb-2">
                  {t("needHelp")}
                </span>
                {supportEmail && (
                  <div className="flex gap-2 items-center">
                    <div>
                      <SlateEmailIcon />{" "}
                    </div>
                    <a
                      href={`mailto:${supportEmail}`}
                      className="text-charcol-gray text-sm 4xl:text-base underline-offset-2 hover:underline"
                    >
                      {supportEmail}
                    </a>
                  </div>
                )}
                {supportPhone && (
                  <div className="flex gap-2 items-center">
                    <div>
                      <SlateCallIcon />{" "}
                    </div>
                    <a
                      href={supportPhoneHref}
                      className="text-charcol-gray text-sm 4xl:text-base underline-offset-2 hover:underline"
                    >
                      {supportPhone}
                    </a>
                  </div>
                )}
              </div>
              <div className="md:flex-[0.5]  space-y-2  ">
                <div className="flex justify-between items-center">
                  <span className="text-charcol-color text-sm 4xl:text-base">
                    {t("subtotal")}
                  </span>
                  <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                    {getCurrencySymbol(pricing.overall.currency)}
                    {pricing.overall.subTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcol-color text-sm 4xl:text-base">
                    {t("shipping")}
                  </span>
                  <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                    {t("free")}
                  </span>
                </div>
                {pricing.overall.discountedPrice &&
                  pricing.overall.discountedPrice <
                    pricing.overall.subTotal && (
                    <div className="flex justify-between items-center pb-4">
                      <span className="text-charcol-color text-sm 4xl:text-base">
                        {t("discount")}
                      </span>
                      <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                        - {getCurrencySymbol(pricing.overall.currency)}
                        {(
                          pricing.overall.subTotal -
                          pricing.overall.discountedPrice
                        )?.toFixed(2)}
                      </span>
                    </div>
                  )}
                {pricing.overall.membershipDiscountAmount > 0 && (
                  <div className="flex justify-between items-center pb-4">
                    <span className="text-charcol-color text-sm 4xl:text-base">
                      {t("membershipDiscount")}
                    </span>
                    <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                      - {getCurrencySymbol(pricing.overall.currency)}
                      {pricing.overall.membershipDiscountAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {pricing.overall.couponDiscountAmount > 0 && (
                  <div className="flex justify-between items-center pb-4">
                    <span className="text-charcol-color text-sm 4xl:text-base">
                      {t("couponDiscount")}
                    </span>
                    <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                      - {getCurrencySymbol(pricing.overall.currency)}
                      {pricing.overall.couponDiscountAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {pricing.overall.subscriptionPlanDiscountAmount > 0 && (
                  <div className="flex justify-between items-center pb-4">
                    <span className="text-charcol-color text-sm 4xl:text-base">
                      {t("subscriptionDiscount")}
                    </span>
                    <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                      - {getCurrencySymbol(pricing.overall.currency)}
                      {pricing.overall.subscriptionPlanDiscountAmount?.toFixed(
                        2
                      )}
                    </span>
                  </div>
                )}
                {pricing.overall.taxAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-charcol-color text-sm 4xl:text-base">
                      {t("tax")}
                    </span>
                    <span className="text-charcol-color text-sm 4xl:text-base font-medium">
                      {getCurrencySymbol(pricing.overall.currency)}
                      {pricing.overall.taxAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-warm-beige/40">
                  <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                    {t("total")}
                  </span>
                  <span className="text-charcol-color text-lg 4xl:text-xl font-medium">
                    {getCurrencySymbol(pricing.overall.currency)}
                    {pricing.overall.grandTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
