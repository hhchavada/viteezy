"use client";

import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import SettingsNav from "./components/SettingsNav";
import SubscribeTab from "./SubscribeTab";
import { AccountProps } from "@/components/types/account";
import MembershipTab from "./MembershipTab";
import SubMemberTab from "./SubMemberTab";
import ChangePasswordTab from "./ChangePasswordTab";
import { useTranslations } from "next-intl";

function getSettingsTitle(
  tab: string,
  tAccount: ReturnType<typeof useTranslations<"Account">>,
  tCommon: ReturnType<typeof useTranslations<"Common">>
): string {
  switch (tab) {
    case "subscribe":
      return tAccount("subscriptions");
    case "membership":
      return tCommon("membership");
    case "sub-members":
      return tAccount("settingsSubMembers");
    case "change-password":
      return tAccount("changePassword");
    default:
      return tAccount("subscriptions");
  }
}

function SettingsContent({ user }: AccountProps) {
    const tAccount = useTranslations("Account");
    const tCommon = useTranslations("Common");
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "subscribe";

    const renderContent = () => {
        switch (tab) {
            case "subscribe":
                return <SubscribeTab />;
            case "membership":
                return <MembershipTab />;
            case "sub-members":
                return <SubMemberTab />;
            case "change-password":
                return <ChangePasswordTab />;
            default:
                return <SubscribeTab />;
        }
    };

    return (
        <MainLayout headerClassName="border-b border-slate-border-color bg-white">
            <div className="min-h-screen bg-white">
                <div className="w-section py-5 4xl:py-16">
                    <SettingsNav title={getSettingsTitle(tab, tAccount, tCommon)} />
                    <div className="mt-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default function SettingsBase(props: AccountProps) {
    return <SettingsContent {...props} />;
}
