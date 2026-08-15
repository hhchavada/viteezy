import React from "react";
import AccountTabs from "@/components/account/components/AccountTabs";
import { settingsTabs } from "@/components/constants/account";

const SettingsNav = ({ title }: { title: string }) => {
    return (
        <div>
            <div className="mb-3">
                <h2 className="text-2xl lg:text-4xl font-medium mt-7">{title}</h2>
                <div className="w-full mt-5">
                    <AccountTabs tabs={settingsTabs} />
                </div>
            </div>
        </div>
    );
};

export default SettingsNav;
