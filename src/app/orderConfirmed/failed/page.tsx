import { Suspense } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import PaymentFailed from "@/components/orderConfirmed/PaymentFailed";

function PaymentFailedFallback() {
  return (
    <div className="min-h-screen bg-off-white-color flex items-center justify-center px-4">
      <div
        className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-teal-green-color animate-spin"
        aria-hidden
      />
    </div>
  );
}

export default function OrderConfirmedFailedPage() {
  return (
    <MainLayout
      isFooter={false}
      simpleHeader
      headerClassName="border-b border-slate-border-color bg-white"
    >
      <Suspense fallback={<PaymentFailedFallback />}>
        <PaymentFailed />
      </Suspense>
    </MainLayout>
  );
}
