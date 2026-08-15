"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import PortalDialog, { DialogHeader, DialogFooter } from "@/components/ui/portalDialog";
import { useBuyMembershipMutation } from "@/store/api/membershipApi";
import { hasAuthToken } from "@/lib/utils";

interface MembershipPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string | null;
  onPurchaseSuccess?: () => void;
}

export default function MembershipPaymentDialog({
  isOpen,
  onClose,
  planId,
  onPurchaseSuccess,
}: MembershipPaymentDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "Stripe" | "Mollie"
  >("Stripe");
  const [buyMembership, { isLoading: isBuying }] = useBuyMembershipMutation();
  const router = useRouter();
  const tCommon = useTranslations("Common");
  const tCheckout = useTranslations("Checkout");
  const tMembership = useTranslations("Membership");

  const handleConfirmPayment = async () => {
    if (!planId) return;

    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }

    try { 
      const response = await buyMembership({
        planId,
        paymentMethod: selectedPaymentMethod,
      }).unwrap();

      if (response.data?.payment?.redirectUrl) {
        window.location.href = response.data.payment.redirectUrl;
        return;
      }

      if (response.data?.payment?.paymentUrl) {
        window.location.href = response.data.payment.paymentUrl;
        return;
      }

      toast.success(tCommon("membershipPurchaseInitiated"));
      onPurchaseSuccess?.();
      onClose();
      router.push("/account?tab=subscribe");
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" && error !== null && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : undefined;
      const message: string =
        typeof apiMessage === "string" && apiMessage.length > 0
          ? apiMessage
          : String(tCommon("failedToPurchaseMembership"));
      toast.error(message);
      console.error("Buy membership error:", error);
    }
  };

  return (
    <PortalDialog
      isShow={isOpen}
      onClose={onClose}
      title={tMembership("choosePaymentMethodTitle")}
      width={520}
      animationType="center"
    >
      <DialogHeader>
        <p className="text-sm text-gray-600">
          {tMembership("selectProviderToContinue")}
        </p>
      </DialogHeader>
      <div className="mt-2 space-y-3">
        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("Stripe")}
          className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer ${selectedPaymentMethod === "Stripe" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`inline-block size-3 rounded-full border ${selectedPaymentMethod === "Stripe" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`}
            />
            {tCheckout("creditCardPayPal")}
          </span>
          <span className="flex items-center gap-2">
            <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
              <img
                src="/payments/p3.webp"
                alt={tMembership("paymentAltVisa")}
                className="h-3 w-auto"
              />
            </span>
            <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
              <img
                src="/payments/p4.webp"
                alt={tMembership("paymentAltMastercard")}
                className="h-3 w-auto"
              />
            </span>
            <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
              <img
                src="/payments/p5.webp"
                alt={tMembership("paymentAltPayPal")}
                className="h-3 w-auto"
              />
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPaymentMethod("Mollie")}
          className={`w-full text-left rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer ${selectedPaymentMethod === "Mollie" ? "border border-teal-500 bg-teal-50" : "border border-extra-light-gray"}`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`inline-block size-3 rounded-full border ${selectedPaymentMethod === "Mollie" ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"}`}
            />
            {tMembership("mollieLabel")}
          </span>
          <span className="flex items-center gap-2">
            <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
              <img
                src="/payments/p1.webp"
                alt={tMembership("paymentAltIdeal")}
                className="h-3 w-auto"
              />
            </span>
            <span className="bg-white border-2 border-linen-color px-2 py-1 rounded-md flex items-center justify-center">
              <img
                src="/payments/p2.webp"
                alt={tMembership("paymentAltBancontact")}
                className="h-3 w-auto"
              />
            </span>
          </span>
        </button>
      </div>
      <DialogFooter>
        <Button
          variant="elevate"
          size="elevate"
          className="bg-teal-green-color hover:bg-dark-teal-green-color"
          onClick={handleConfirmPayment}
          disabled={isBuying || !planId}
        >
          {isBuying ? tCheckout("processing") : tCheckout("payNow")}
        </Button>
      </DialogFooter>
    </PortalDialog>
  );
}
