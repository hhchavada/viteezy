"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AccountLayout from "./components/AccountLayout";
import Profile from "./profile";
import OrderHistory from "./orderHistory";
import Favourites from "./favourites";
import Subscribe from "./subscribe";
import Addresses from "./addresses";
import { AccountProps } from "@/components/types/account";
import { useLogout } from "@/hooks";

function AccountContent({ userName, user }: AccountProps) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "profile";
  const { logout, isLoggingOut } = useLogout();

  const renderContent = () => {
    switch (tab) {
      case "profile":
        return <Profile user={user} />;
      case "orders":
        return <OrderHistory />;
      case "favorites":
        return <Favourites />;
      case "subscribe":
        return <Subscribe />;
      case "addresses":
        return <Addresses />;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <AccountLayout
      userName={userName}
      user={user}
      onLogout={logout}
      isLoggingOut={isLoggingOut}
    >
      {renderContent()}
    </AccountLayout>
  );
}

export default function AccountBase(props: AccountProps) {
  return <AccountContent {...props} />;
}
