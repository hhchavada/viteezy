import MainLayout from "@/components/layouts/MainLayout";
import OrderConfirmedPage from "@/components/orderConfirmed";

export default function OrderConfirmedSuccess() {
  return (
    <MainLayout
      isFooter={false}
      simpleHeader
      headerClassName="border-b border-slate-border-color bg-white"
    >
      <div className="min-h-screen ">
        <OrderConfirmedPage />
      </div>
    </MainLayout>
  );
}
