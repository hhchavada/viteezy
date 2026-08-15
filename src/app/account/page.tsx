"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AccountBase from "@/components/account";
import { useGetUserMeQuery } from "@/store/api/userApi";
import FullscreenLoader from "@/components/ui/fullscreenLoader";
import { useTranslations } from "next-intl";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { data, isLoading, error } = useGetUserMeQuery();
  const t = useTranslations("Account");

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isLoading && (!data?.success || !data?.data?.user)) {
      router.push("/login");
      return;
    }

    if (!tab) {
      router.replace("/account?tab=profile");
    }
  }, [tab, router, isLoading, data]);

  // Show loading while checking authentication
  if (isLoading) {
    return <FullscreenLoader />;
  }

  // Show loading or redirect if authentication failed
  if (!data?.success || !data?.data?.user) {
    return <FullscreenLoader />;
  }

  const userName = data?.data?.user?.name || t("guestUserName");

  return <AccountBase userName={userName} user={data?.data?.user} />;
}

export default function AccountPage() {
  return <AccountContent />;
}
