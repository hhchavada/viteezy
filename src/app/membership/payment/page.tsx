import MainLayout from "@/components/layouts/MainLayout";
import MembershipPayment from "@/components/membership/payment";

export default function MembershipPaymentPage() {
    return (
        <MainLayout headerClassName="border-slate-border-color border-b">
            <div className="min-h-screen">
                <MembershipPayment />
            </div>
        </MainLayout>
    );
}
