"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SettingsBase from "@/components/settings";
import { useGetUserMeQuery } from "@/store/api/userApi";
import FullscreenLoader from "@/components/ui/fullscreenLoader";
import { useTranslations } from "next-intl";

function SettingsContent() {
    const tAccount = useTranslations("Account");
    const tCommon = useTranslations("Common");
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const { data, isLoading } = useGetUserMeQuery();

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!isLoading && (!data?.success || !data?.data?.user)) {
            router.push("/login");
            return;
        }

        if (!tab) {
            router.replace("/settings?tab=subscribe");
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

    const user = data?.data?.user;
    const userName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || tAccount("guestUserName")
        : tAccount("guestUserName");
    return <SettingsBase userName={userName} user={user} />;
}

export default function SettingsPage() {
    const tCommon = useTranslations("Common");
    return (
        <section className="min-h-screen bg-white">
            <Suspense fallback={<div>{tCommon("loading")}</div>}>
                <SettingsContent />
            </Suspense>
        </section>
    )
}
