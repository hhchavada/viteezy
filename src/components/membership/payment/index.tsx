"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import InputField from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetMembershipPlansQuery, useBuyMembershipMutation } from "@/store/api/membershipApi";
import Spinner from "@/components/ui/spinner";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { getCurrencySymbol } from "@/lib/utils";

export default function MembershipPayment() {
    const tCommon = useTranslations("Common");
    const tCheckout = useTranslations("Checkout");
    const tAuth = useTranslations("Auth");
    const tMembership = useTranslations("Membership");
    const searchParams = useSearchParams();
    const router = useRouter();
    const planId = searchParams.get("planId");

    const { data: plansData, isLoading: isLoadingPlans } = useGetMembershipPlansQuery();
    const [buyMembership, { isLoading: isBuying }] = useBuyMembershipMutation();

    const [selectedPlanId, setSelectedPlanId] = useState<string>(planId || "");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        cardNumber: "",
        expiry: "",
        cvc: "",
        cardName: "",
        billingSameAsShipping: false,
    });

    const [method, setMethod] = useState<"cardOrPaypal" | "ideal">("cardOrPaypal");
    const [cardOption, setCardOption] = useState<"creditcard" | "paypal">("creditcard");

    const plans = plansData?.data?.plans || [];
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    // Update selectedPlanId when plans load and planId from URL exists
    useEffect(() => {
        if (plans.length > 0 && planId) {
            setSelectedPlanId(planId);
        } else if (plans.length > 0 && !selectedPlanId) {
            setSelectedPlanId(plans[0].id);
        }
    }, [plans, planId, selectedPlanId]);

    const priceText = useMemo(() => {
        if (!selectedPlan) return "";
        const currency = getCurrencySymbol(selectedPlan.price.currency);
        return `${currency}${selectedPlan.price.amount.toFixed(2)}/${selectedPlan.interval.toLowerCase()}`;
    }, [selectedPlan]);

    const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [key]: value as any }));
    };

    const handleBuyMembership = async () => {
        if (!selectedPlanId) {
            toast.error(tCommon("selectPlanRequired"));
            return;
        }

        // Determine payment method based on selection
        let paymentMethod = "Stripe";
        if (method === "ideal") {
            paymentMethod = "iDeal";
        } else if (cardOption === "paypal") {
            paymentMethod = "PayPal";
        }

        try {
            const response = await buyMembership({
                planId: selectedPlanId,
                paymentMethod,
            }).unwrap();

            toast.success(tCommon("membershipPurchasedSuccessfully"));

            // If there's a payment URL, redirect to it
            if (response.data?.payment?.paymentUrl) {
                window.location.href = response.data.payment.paymentUrl;
            } else {
                // Redirect to success page or account page
                router.push("/account?tab=subscribe");
                // Reload page after successful membership payment
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || tCommon("failedToPurchaseMembership"));
            console.error("Buy membership error:", error);
        }
    };

    if (isLoadingPlans) {
        return (
            <section className="min-h-screen bg-slate-50-color section-padding flex items-center justify-center">
                <Spinner />
            </section>
        );
    }

    if (!selectedPlan) {
        return (
            <section className="min-h-screen bg-slate-50-color section-padding flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slightly-gray">{tCommon("noPlansAvailable")}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-slate-50-color section-padding">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 py-8">
                    <h1 className="text-2xl md:text-3xl font-semibold">
                        {tMembership("getYourMembershipTitle")}
                    </h1>
                    <p className="text-sm text-slightly-gray">
                        {selectedPlan.shortDescription}: <span className="text-teal-700 font-medium">{priceText}</span>{" "}
                        {tMembership("pricePlusApplicableTaxes")}
                    </p>

                    {/* Plan Toggle */}
                    {plans.length > 1 && (
                        <div className="inline-flex gap-2 bg-gains-light-boro/60 rounded-full p-1 mt-3">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlanId(plan.id)}
                                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${selectedPlanId === plan.id ? "bg-white text-black-color shadow-sm" : "text-slightly-gray hover:text-gray-900"}`}
                                >
                                    {plan.interval}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-white radius-style p-6 shadow-sm">
                    {/* Basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            placeholder={tCheckout("firstNamePlaceholder")}
                            value={form.firstName}
                            onChange={handleChange("firstName")}
                        />
                        <InputField
                            placeholder={tCheckout("lastNamePlaceholder")}
                            value={form.lastName}
                            onChange={handleChange("lastName")}
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <InputField
                            type="email"
                            placeholder={tMembership("emailOrMemberIdPlaceholder")}
                            value={form.email}
                            onChange={handleChange("email")}
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            type="password"
                            placeholder={tMembership("createPasswordPlaceholder")}
                            value={form.password}
                            onChange={handleChange("password")}
                        />
                        <InputField
                            type="password"
                            placeholder={tAuth("confirmPassword")}
                            value={form.confirmPassword}
                            onChange={handleChange("confirmPassword")}
                        />
                    </div>

                    {/* Payment method selector */}
                    <div className="mt-6">
                        <p className="text-sm font-medium mb-3">
                            {tMembership("paymentHeading")}
                        </p>

                        <div className="space-y-3">
                            {/* Credit card / PayPal group */}
                            <button
                                type="button"
                                onClick={() => setMethod("cardOrPaypal")}
                                className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors ${method === "cardOrPaypal" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`inline-block size-3 rounded-full border ${method === "cardOrPaypal" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`} />
                                    {tCheckout("creditCardPayPal")}
                                </span>
                                <span className="flex items-center gap-2">
                                    {/* Brand badges to match design */}
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p3.webp" alt={tMembership("paymentAltVisa")} width={40} height={14} className="h-3 w-auto" />
                                    </span>
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p4.webp" alt={tMembership("paymentAltMastercard")} width={40} height={14} className="h-3 w-auto" />
                                    </span>
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p5.webp" alt={tMembership("paymentAltPayPal")} width={40} height={14} className="h-3 w-auto" />
                                    </span>
                                </span>
                            </button>

                            {/* iDeal group */}
                            <button
                                type="button"
                                onClick={() => setMethod("ideal")}
                                className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors ${method === "ideal" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`inline-block size-3 rounded-full border ${method === "ideal" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`} />
                                    {tMembership("mollieLabel")}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p1.webp" alt={tMembership("paymentAltIdeal")} width={40} height={14} className="h-3 w-auto" />
                                    </span>
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p2.webp" alt={tMembership("paymentAltBancontact")} width={40} height={14} className="h-3 w-auto" />
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Details section */}
                    {method === "cardOrPaypal" && (
                        <div className="mt-5 space-y-3">
                            {/* Secondary radio inside */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setCardOption("creditcard")}
                                    className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors ${cardOption === "creditcard" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`inline-block size-3 rounded-full border ${cardOption === "creditcard" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`} />
                                        {tCheckout("creditCardPayPal")}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                            <Image src="/payments/p3.webp" alt={tMembership("paymentAltVisa")} width={40} height={14} className="h-3 w-auto" />
                                        </span>
                                        <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                            <Image src="/payments/p4.webp" alt={tMembership("paymentAltMastercard")} width={40} height={14} className="h-3 w-auto" />
                                        </span>
                                        <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                            <Image src="/payments/p5.webp" alt={tMembership("paymentAltPayPal")} width={40} height={14} className="h-3 w-auto" />
                                        </span>
                                    </span>
                                </button>

                                {cardOption === "creditcard" && (
                                    <div className="grid grid-cols-1 gap-4 border rounded-xl p-4">
                                        <InputField
                                            placeholder={tMembership("cardNumberPlaceholder")}
                                            value={form.cardNumber}
                                            onChange={handleChange("cardNumber")}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputField
                                                placeholder={tMembership("expiryPlaceholder")}
                                                value={form.expiry}
                                                onChange={handleChange("expiry")}
                                            />
                                            <InputField
                                                placeholder={tMembership("securityCodePlaceholder")}
                                                value={form.cvc}
                                                onChange={handleChange("cvc")}
                                            />
                                            <InputField
                                                placeholder={tMembership("nameOnCardPlaceholder")}
                                                value={form.cardName}
                                                onChange={handleChange("cardName")}
                                            />
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-slightly-gray select-none">
                                            <input
                                                type="checkbox"
                                                checked={form.billingSameAsShipping}
                                                onChange={handleChange("billingSameAsShipping")}
                                                className="w-4 h-4 rounded border-extra-light-gray"
                                            />
                                            {tMembership("useShippingAddressAsBillingAddress")}
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setCardOption("paypal")}
                                    className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors ${cardOption === "paypal" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className={`inline-block size-3 rounded-full border ${cardOption === "paypal" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`} />
                                        {tMembership("paypalLabel")}
                                    </span>
                                    <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
                                        <Image src="/payments/p5.webp" alt={tMembership("paymentAltPayPal")} width={50} height={18} className="h-4 w-auto" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {method === "ideal" && (
                        <div className="mt-4 border rounded-xl p-6 text-center text-sm text-slightly-gray">
                            {tMembership("afterPayWithPayPalNotice")}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="mt-6">
                        <Button
                            variant="tealElevate"
                            size="elevate"
                            className="w-full"
                            onClick={handleBuyMembership}
                            disabled={isBuying}
                        >
                            {isBuying ? tCheckout("processing") : tCheckout("payNow")}
                        </Button>
                        <p className="text-[12px] text-slightly-gray mt-3">
                            {tMembership("membershipPaymentConsentText")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
