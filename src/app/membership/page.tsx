import MainLayout from "@/components/layouts/MainLayout";
import MembershipPage from "@/components/membership";

export default function Membership() {
  return (
    <MainLayout headerClassName="border-slate-border-color border-b">
      <div className="min-h-screen ">
        <MembershipPage />
      </div>
    </MainLayout>
  );
}
