"use client";

import React, { useState, useEffect } from "react";
import InputField from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddIcon, Home } from "@/components/icons";
import { Check, Dot, Minus, Pencil, Trash2, X } from "lucide-react";
import AddressForm, { AddressFormData } from "./AddressForm";
import { AddressFormData as ValidationAddressFormData } from "@/hooks/useAddressValidation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
} from "@/store/api/addressApi";
import { Address } from "@/store/api/types/addresses.types";
import {
  useCreateOrderMutation,
  useGetCartQuery,
  useGetQuizRecommendationCartQuery,
  useCreatePaymentMutation,
} from "@/store";
import type { QuizRecommendationCartRequest } from "@/store/api/cartApi";
import { CheckoutPageSummaryResponse } from "@/store/api/types/cart.types";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoggedInUserEmail } from "@/lib/utils";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import { toast } from "react-hot-toast";

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  apartment?: string;
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  email: string;
  phone: string;
  isDefault: boolean;
}

interface UserAddressesProps {
  onAddressSelect?: (addressId: string) => void;
  onLayoutChange?: () => void;
  checkoutData?: CheckoutPageSummaryResponse["data"];
  selectedPlanKey?: string;
  isCheckoutLoading?: boolean;
  isValidating?: boolean;
  selectedMemberId?: string;
  isQuizCheckout?: boolean;
  quizCartParams?: QuizRecommendationCartRequest;
  onPaymentRedirectStart?: () => void;
  onPaymentRedirectEnd?: () => void;
}

const UserAddresses: React.FC<UserAddressesProps> = ({
  onAddressSelect,
  onLayoutChange,
  checkoutData,
  selectedPlanKey = "",
  isCheckoutLoading = false,
  isValidating = false,
  selectedMemberId,
  isQuizCheckout = false,
  quizCartParams,
  onPaymentRedirectStart,
  onPaymentRedirectEnd,
}) => {
  const tCheckout = useTranslations("Checkout");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAddressId, setSelectedAddressId] = useState("1");
  const [email, setEmail] = useState("michael.thompson@mail.com");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "Stripe" | "Mollie"
  >("Stripe");
  const { data, isLoading, isFetching } = useGetAddressesQuery(
    selectedMemberId ? { subMemberId: selectedMemberId } : undefined
  );
  const addresses: Address[] = data?.data?.addresses || [];
  const [deleteAddress] = useDeleteAddressMutation();
  const [createAddress, { isLoading: isCreating, reset: resetCreateAddress }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating, reset: resetUpdateAddress }] =
    useUpdateAddressMutation();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation();
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

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  console.log("searchParams", searchParams);
  // Auto-select first address if no address is selected or selected address doesn't exist
  useEffect(() => {
    if (sortedAddresses.length > 0) {
      const selectedExists = sortedAddresses.some(
        (addr) => addr._id === selectedAddressId
      );
      if (!selectedExists || !selectedAddressId) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setSelectedAddressId(sortedAddresses[0]._id);
        }, 0);
      }
    } else {
      setTimeout(() => {
        setSelectedAddressId("");
      }, 0);
    }
  }, [sortedAddresses, selectedAddressId]);

  // Static saved addresses data
  const savedAddresses: SavedAddress[] = [
    {
      id: "1",
      name: "Michael Thompson",
      address: "2289 Willow Creek Road",
      apartment: "Apt 204",
      city: "Denver",
      state: "Colorado (CO)",
      zipCode: "80212",
      country: "United States",
      email: "michael.thompson@mail.com",
      phone: "+1 303-555-4829",
      isDefault: true,
    },
    {
      id: "2",
      name: "Emma Robinson",
      address: "1590 Lakeview Drive",
      city: "Austin",
      state: "Texas (TX)",
      zipCode: "78704",
      country: "United States",
      email: "emma.robinson@mail.com",
      phone: "+1 512-555-6743",
      isDefault: false,
    },
  ];

  const handleAddressSelect = (addressId: string) => {
    if (!editingAddressId && !showAddForm) {
      setSelectedAddressId(addressId);
      onAddressSelect?.(addressId);
      onLayoutChange?.();
    }
  };

  const handleEditAddress = (addressId: string) => {
    setEditingAddressId(addressId);
    onLayoutChange?.();
  };

  const handleAddAddress = () => {
    setShowAddForm(true);
    onLayoutChange?.();
  };

  const handleDeleteAddress = (addressId: string) => {
    // TODO: Open delete confirmation modal
    console.log("Delete address:", addressId);
  };

  const handleFormSubmit = async (
    data: ValidationAddressFormData,
    mode: "add" | "edit"
  ) => {
    try {
      if (mode === "add") {
        const submitData = {
          firstName: data.firstName,
          lastName: data.lastName,
          streetName: data.streetName,
          houseNumber: data.houseNumber,
          houseNumberAddition: data.houseNumberAddition || "",
          postalCode: data.postalCode,
          address: data.address,
          phone: data.phone,
          country: data.country,
          city: data.city,
          isDefault: data.isDefault || false,
          note: data.note || "",
          email: getLoggedInUserEmail(),
        };

        await createAddress(submitData).unwrap();
        setShowAddForm(false);
      } else if (mode === "edit" && editingAddressId) {
        const submitData = {
          firstName: data.firstName,
          lastName: data.lastName,
          streetName: data.streetName,
          houseNumber: data.houseNumber,
          houseNumberAddition: data.houseNumberAddition || "",
          postalCode: data.postalCode,
          address: data.address,
          phone: data.phone,
          country: data.country,
          city: data.city,
          isDefault: data.isDefault || false,
          note: data.note || "",
          email: getLoggedInUserEmail(),
        };

        await updateAddress({
          id: editingAddressId,
          data: submitData,
        }).unwrap();
        setEditingAddressId(null);
        onLayoutChange?.();
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(
        getApiErrorFromUnknown(error, {
          fallback: tCheckout("failedToSaveAddress"),
        })
      );
    }
  };

  const handleFormCancel = () => {
    resetCreateAddress();
    resetUpdateAddress();
    setShowAddForm(false);
    setEditingAddressId(null);
    onLayoutChange?.();
  };

  const handleDelete = async (addressId: string) => {
    if (confirm(tCheckout("confirmDeleteAddress"))) {
      try {
        await deleteAddress(addressId).unwrap();
        // If the deleted address was selected, useEffect will automatically
        // select the first address from the updated list after cache update
        onLayoutChange?.();
        toast.success(tCheckout("addressDeletedSuccessfully"));
      } catch {
        toast.error(tCheckout("failedToDeleteAddress"));
      }
    }
  };

  const getFormInitialData = (
    addressId: string
  ): Partial<ValidationAddressFormData> | undefined => {
    const address = addresses.find((a) => a._id === addressId);
    if (address) {
      return {
        firstName: address.firstName || "",
        lastName: address.lastName || "",
        streetName: address.streetName || "",
        houseNumber: address.houseNumber || "",
        houseNumberAddition: address.houseNumberAddition || "",
        postalCode: address.postalCode || "",
        address: address.address || "",
        phone: address.phone || "",
        country: address.country || "",
        city: address.city || "",
        isDefault: address.isDefault || false,
        note: address.note || "",
      };
    }
    return undefined;
  };

  const handlePayNow = async () => {
    // Validate that an address is selected
    if (!selectedAddressId) {
      toast.error(tCheckout("selectShippingAddress"));
      return;
    }

    // Validate that checkout data exists
    if (!checkoutData) {
      toast.error(tCheckout("checkoutDataUnavailable"));
      return;
    }

    // Get cart information (for fallback cartId / coupon)
    const cart = cartData?.data?.cart;

    // Derive cartId: prefer checkout summary cartId, fallback to cart._id
    const cartId = checkoutData.cart.cartId || cart?._id;
    if (!cartId) {
      toast.error(tCheckout("cartDataUnavailable"));
      return;
    }

    const checkoutCoupon = (checkoutData as any)?.coupon;
    const summaryCouponInvalid =
      checkoutCoupon != null && checkoutCoupon.isValid !== true;
    const couponValid = !summaryCouponInvalid;
    const couponCode = couponValid
      ? cart?.couponCode || checkoutCoupon?.code
      : undefined;

    // Split items by variant from checkout summary
    const cartItems = checkoutData.cart.items || [];
    const sachetsItems = cartItems.filter((item) => item.variant === "SACHETS");
    const standUpPouchItems = cartItems.filter(
      (item) => item.variant === "STAND_UP_POUCH"
    );
    console.log(cartItems);
    // Build sachets payload from sachetsPlans
    let sachetsPayload: any | undefined;
    if (
      sachetsItems.length > 0 &&
      checkoutData.sachetsPlans &&
      checkoutData.sachetsPlans.length > 0
    ) {
      const sachetsPlans = checkoutData.sachetsPlans;
      const selectedSachetsPlan = selectedPlanKey
        ? sachetsPlans.find((p) => p.planKey === selectedPlanKey)
        : sachetsPlans.find((p) => p.isSelected) || sachetsPlans[0];

      if (!selectedSachetsPlan) {
        toast.error(tCheckout("selectSachetsSubscriptionPlan"));
        return;
      }

      // Determine if sachets plan is one-time based on planKey convention
      const sachetsIsOneTime = selectedSachetsPlan.planKey
        ? selectedSachetsPlan.planKey.toLowerCase().includes("onetime")
        : false;

      sachetsPayload = {
        planDurationDays: selectedSachetsPlan.durationDays,
        isOneTime: sachetsIsOneTime,
      };
    }

    // Resolve capsule count from the selected checkout plan first because
    // page-summary may not echo it back on cart.items[].basePlanPrice.
    const standUpPouchPlans = checkoutData.standUpPouchPlans || {};

    // Build stand-up pouch payload from cart items
    let standUpPouchPayload: any | undefined;
    if (standUpPouchItems.length > 0) {
      standUpPouchPayload = {
        itemQuantities: standUpPouchItems.map((item) => {
          const plans = standUpPouchPlans[item.productId] || [];
          const selectedPlan = plans.find((plan: any) => plan.isSelected);

          return {
            capsuleCount:
              selectedPlan?.capsuleCount ||
              item.basePlanPrice?.capsuleCount ||
              0,
            productId: item.productId,
            quantity: item.quantity || 1,
          };
        }),
      };
    }

    // Build pricing payload using checkout summary pricing
    const pricingAny: any = checkoutData.pricing || {};
    const overall = pricingAny.overall || {};

    const pricingPayload: any = {
      overall: {
        subTotal: overall.subTotal || 0,
        discountedPrice: overall.discountedPrice || 0,
        couponDiscountAmount: summaryCouponInvalid
          ? 0
          : overall.couponDiscountAmount || 0,
        membershipDiscountAmount: overall.membershipDiscountAmount || 0,
        subscriptionPlanDiscountAmount:
          overall.subscriptionPlanDiscountAmount || 0,
        taxAmount: overall.taxAmount || 0,
        grandTotal: overall.grandTotal || overall.discountedPrice || 0,
        currency: overall.currency || "USD",
      },
    };

    if (pricingAny.sachets) {
      pricingPayload.sachets = pricingAny.sachets;
    }

    if (pricingAny.standUpPouch) {
      pricingPayload.standUpPouch = pricingAny.standUpPouch;
    }

    // Build final order payload matching API contract
    const orderPayload: any = {
      cartId,
      shippingAddressId: selectedAddressId,
      pricing: pricingPayload,
      paymentMethod: selectedPaymentMethod,
    };

    if (sachetsPayload) {
      orderPayload.sachets = sachetsPayload;
    }

    if (standUpPouchPayload) {
      orderPayload.standUpPouch = standUpPouchPayload;
    }

    if (couponCode) {
      orderPayload.couponCode = couponCode;
    }

    // Add orderedFor and relationshipType if a member is selected
    if (selectedMemberId) {
      orderPayload.orderedFor = selectedMemberId;
      orderPayload.relationshipType = "FAMILY";
    }

    // Debug: Log the payload before sending
    console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

    onPaymentRedirectStart?.();

    try {
      // Step 1: Create the order
      const orderResponse = await createOrder(orderPayload).unwrap();

      // Handle successful order creation
      if (
        orderResponse.success &&
        (orderResponse.data?.order?.id ||
          (orderResponse.data as any)?.order?._id)
      ) {
        const orderId = (orderResponse.data?.order?.id ??
          (orderResponse.data as any)?.order?._id) as string;
        console.log("Order created successfully:", orderId);

        // Step 2: Create payment with the order ID
        try {
          const paymentPayload = {
            orderId: orderId,
            paymentMethod: selectedPaymentMethod,
            // successUrl:
            //   window.location.origin + `/orderConfirmed?orderId=${orderId}`,
          };

          console.log(
            "Payment Payload:",
            JSON.stringify(paymentPayload, null, 2)
          );

          const paymentResponse = await createPayment(paymentPayload).unwrap();

          // Handle successful payment creation
          if (paymentResponse.success) {
            console.log("Payment created successfully");

            // If there's a payment URL, redirect to it
            const redirectUrl: any =
              (paymentResponse as any)?.data?.gateway?.redirectUrl ||
              paymentResponse.data?.paymentUrl ||
              paymentResponse.data?.payment?.paymentUrl ||
              // Some gateways might return redirectUrl under payment
              (paymentResponse.data as any)?.payment?.redirectUrl;
            if (redirectUrl) {
              console.log("Redirecting to payment:", redirectUrl);
              window.location.replace(redirectUrl);
              return;
            }

            onPaymentRedirectEnd?.();
            // Fallback to order confirmation if no external redirect is provided
            router.push(`/orderConfirmed?orderId=${orderId}`);
          }
        } catch (paymentError: any) {
          onPaymentRedirectEnd?.();
          console.error("Failed to create payment:", paymentError);
          toast.error(
            paymentError?.data?.message || tCheckout("failedToCreatePayment")
          );
        }
      } else {
        onPaymentRedirectEnd?.();
      }
    } catch (error: any) {
      onPaymentRedirectEnd?.();
      console.error("Failed to create order:", error);
      toast.error(error?.data?.message || tCheckout("failedToCreateOrder"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      {/* <div className="rounded-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Contact information
        </h2>
        <InputField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div> */}

      {/* Shipping Address */}
      <div className="rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            {tCheckout("shippingAddressSection")}
          </h2>

          {/* Add Address Button - Hide for sub-member addresses */}
          {!selectedMemberId && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[17px] font-medium text-teal-500 hover:bg-inherit hover:text-teal-500 ring-0"
              onClick={showAddForm ? handleFormCancel : handleAddAddress}
            >
              {showAddForm ? <Minus size={16} /> : <AddIcon />}
              {tCheckout("newAddress")}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {(isLoading || isFetching) && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        )}

        {/* New Address Form - Hide for sub-member addresses */}
        {!selectedMemberId && showAddForm && (
          <div className="mb-6 bg-neutral-50 rounded-lg p-5 border border-gray-200 transition-all duration-300 ease-in-out opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tCheckout("newAddress")}
            </h3>
            <AddressForm
              mode="add"
              initialData={undefined}
              onSubmit={(data) => handleFormSubmit(data, "add")}
              onCancel={handleFormCancel}
              isLoading={isCreating}
            />
          </div>
        )}

        {/* Saved Addresses List */}
        {!isLoading && !isFetching && (
          <div className="space-y-4">
            {sortedAddresses.map((address) => {
              const isSelected = selectedAddressId === address._id;
              const isEditing = editingAddressId === address._id;
              const fullAddress = [
                address.streetName,
                address.houseNumber,
                address.address,
                address.city,
                address.country,
                address.postalCode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={address._id}
                  className={`rounded-lg p-4  transition-all relative overflow-hidden ${
                    isSelected
                      ? "outline-teal-500 outline-2 pt-10 "
                      : "outline-neutral-sand-100 outline-1"
                  } ${isEditing ? "bg-neutral-50" : "bg-white cursor-pointer"}`}
                  onClick={() => !isEditing && handleAddressSelect(address._id)}
                >
                  {/* Address Details - Always Visible */}
                  <div className={isEditing ? "mb-7" : ""}>
                    <div className="flex items-start gap-4">
                      {/* Checkmark - Only show when selected and not editing */}
                      {isSelected && (
                        <div className="flex flex-col items-center gap-2 absolute -top-1 -start-1">
                          <div className="w-7 h-7 rounded-br-md bg-teal-500 flex items-center justify-center">
                            <Check
                              className="w-3.5 h-3.5 mt-0.5 ms-0.5 text-white"
                              strokeWidth={4}
                            />
                          </div>
                        </div>
                      )}

                      {/* Address Content */}
                      <div className="flex-1">
                        {address.isDefault && (
                          <span className="text-sm text-teal-600 bg-teal-100 px-2 py-1 inline-block rounded mb-3">
                            {tCheckout("defaultAddressBadge")}
                          </span>
                        )}
                        <div className="flex items-center mb-2">
                          <h3 className="text-base font-semibold text-gray-900 break-all line-clamp-2">
                            {address?.firstName + " " + address?.lastName}
                          </h3>
                          <span>
                            <Dot />
                          </span>
                          <Home className="w-5 min-w-5 h-5 min-h-5 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 break-all line-clamp-3">
                          {fullAddress}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {address.country}
                        </p>

                        {/* Email and Phone */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-gray-600">{address.phone}</span>
                        </div>
                      </div>

                      {/* Edit and Delete Icons - Hide for sub-member addresses */}
                      {!selectedMemberId && (
                        <div className="flex items-center">
                          {isEditing ? (
                            <button
                              onClick={handleFormCancel}
                              className=" hover:bg-gray-100 rounded-sm transition-colors cursor-pointer p-2"
                            >
                              <X className="w-4 h-4 text-gray-600" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address._id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
                              aria-label={tCheckout("editAddressAria")}
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(address._id)}
                            className="p-2 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
                            aria-label={tCheckout("deleteAddressAria")}
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Form - Hide for sub-member addresses */}
                  {!selectedMemberId && isEditing && (
                    <div className="transition-all duration-300 ease-in-out opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {tCheckout("editAddress")}
                      </h3>
                      <AddressForm
                        mode="edit"
                        initialData={getFormInitialData(address._id)}
                        onSubmit={(data) => handleFormSubmit(data, "edit")}
                        onCancel={handleFormCancel}
                        isLoading={isUpdating}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* payment */}
      <div className="rounded-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {tCheckout("paymentMethod")}
        </h2>
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Credit Card / PayPal Option */}
          <div
            onClick={() => setSelectedPaymentMethod("Stripe")}
            className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === "Stripe"
                ? "bg-teal-50"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === "Stripe"
                    ? "border-teal-500 bg-teal-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {selectedPaymentMethod === "Stripe" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </div>
              <span className="text-base font-medium text-gray-900">
                {tCheckout("creditCardPayPal")}
              </span>
            </div>
            {/* <img src="/payments/paypal.svg" alt={tCheckout("brandPayPal")} className="h-6" /> */}
            <img
              src="/payments/stripe.svg"
              alt={tCheckout("creditCardPayPal")}
              className="h-5"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* iDeal / Bancontact Option */}
          <div
            onClick={() => setSelectedPaymentMethod("Mollie")}
            className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === "Mollie"
                ? "bg-teal-50"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === "Mollie"
                    ? "border-teal-500 bg-teal-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {selectedPaymentMethod === "Mollie" && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                )}
              </div>
              <span className="text-base font-medium text-gray-900">
                {/* Brand name; keep as-is */}
                {tCheckout("mollieLabel")}
              </span>
            </div>
            <img
              src="/payments/mollie.svg"
              alt={tCheckout("brandBancontact")}
              className="h-3.5"
            />
          </div>
        </div>
      </div>
      {/* Pay Now Button */}
      <Button
        type="button"
        variant="tealElevate"
        size="elevate"
        className="w-full mt-1"
        onClick={handlePayNow}
        disabled={
          isCreatingOrder ||
          isCreatingPayment ||
          !selectedAddressId ||
          isCheckoutLoading ||
          isValidating
        }
        animateText
      >
        {isCreatingOrder
          ? tCheckout("creatingOrder")
          : isCreatingPayment
          ? tCheckout("processingPayment")
          : isCheckoutLoading
          ? tCheckout("loadingCheckout")
          : isValidating
          ? tCheckout("validatingCart")
          : tCheckout("payNow")}
      </Button>

      {/* Legal Text */}
    </div>
  );
};

export default UserAddresses;
