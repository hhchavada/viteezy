"use client";

import React from "react";
import { AccountLayoutProps } from "@/components/types/account";
import MainLayout from "@/components/layouts/MainLayout";
import AccountBanner from "./AccountBanner";

export default function AccountLayout({
  children,
  userName,
  user,
  onLogout,
  isLoggingOut,
}: AccountLayoutProps) {
  return (
    <MainLayout headerClassName=" border-slate-border-color bg-white">
      <div className="min-h-screen bg-white">
        <AccountBanner
          userName={userName}
          user={user}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
        <div className="w-section py-8 md:py-14 2xl:py-12">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
