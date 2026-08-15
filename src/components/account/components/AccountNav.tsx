import React from "react";
import AccountTabs from "./AccountTabs";
import { accountTabs } from "@/components/constants/account";
import { getUserFromStorage } from "@/lib/utils";

const AccountNav = ({ title }: { title: string }) => {
  const user = getUserFromStorage();

  return (
    <div>
      <div className="mb-3">
        {/* <h1 className="text-4xl sm:text-5xl 4xl:text-[52px] font-medium text-black-color mb-5 sm:mb-6 md:mb-8">
          Hi, {user?.firstName || "user"}
          </h1> */}
        <h2 className="text-3xl font-medium mt-7">{title}</h2>
        <div className="w-full mt-5">
          <AccountTabs tabs={accountTabs} />
          {/* <hr className="w-full basis-full border-0 h-px bg-slate-border-color shrink-0" /> */}
        </div>
      </div>
    </div>
  );
};

export default AccountNav;
