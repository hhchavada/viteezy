import MainLayout from "@/components/layouts/MainLayout";
import ConfirmMembershipPage from "@/components/confirmMembership";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | Viteezy Membership",
  description:
    "Your Viteezy membership is confirmed. Thank you for joining us.",
};

export default function ConfirmMembership() {
  return (
    <MainLayout
      isFooter={false}
      simpleHeader
      headerClassName="border-b border-slate-border-color bg-white"
    >
      <ConfirmMembershipPage />
    </MainLayout>
  );
}
