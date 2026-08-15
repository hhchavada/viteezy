"use client";

import React, { memo } from "react";
import AccountNav from "../components/AccountNav";
import { Button } from "@/components/ui/button";
import { User } from "@/store/api/types/user.types";
import EditProfileModal from "./EditProfileModal";
import { useTranslations } from "next-intl";

interface ProfileProps {
  user?: User;
}

const Profile = ({ user }: ProfileProps) => {
  const t = useTranslations("Account");

  // Prefer discrete first/last name from API; fallback to parsing name
  const firstName = (user?.firstName ?? "").trim() || (user?.name?.split(" ")[0] || "");
  const lastName = (user?.lastName ?? "").trim() || (user?.name ? user.name.split(" ").slice(1).join(" ") : "");

  const profileData = [
    { label: t("firstName"), value: firstName || null },
    { label: t("lastName"), value: lastName || null },
    { label: t("email"), value: user?.email || null },
    ...(user?.phone
      ? [
          {
            label: t("phone"),
            value: `${user.countryCode || ""} ${user.phone}`.trim(),
          },
        ]
      : []),
  ];

  return (
    <div>
      <AccountNav title={t("tabs.profile")} />
      <div className="bg-slate-50-color p-10 min-w-full sm:min-w-120 max-w-fit rounded-xl space-y-5 mt-7">
        {profileData.map((item) => (
          <div key={item.label} className="">
            <span className="text-lg font-medium text-primary block">
              {item.label}
            </span>
            <span className="text-base font-normal text-gray-500">
              {item.value ? item.value : t("notProvided")}
            </span>
          </div>
        ))}
        <EditProfileModal
          user={user}
          trigger={
            <Button
              className="bg-white hover:bg-white text-black border hover:rounded-[12px] text-base h-12.5!"
              size="elevate"
              variant="elevate"
              animateText
            >
              {t("updateAccount")}
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default memo(Profile);
