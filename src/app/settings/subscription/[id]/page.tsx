"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/MainLayout";
import { useGetUserMeQuery } from "@/store/api/userApi";
import SubscriptionDetailPage from "@/components/settings/subscription";
import FullscreenLoader from "@/components/ui/fullscreenLoader";
import { useTranslations } from "next-intl";

function SubscriptionDetailContent() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;
    const { data, isLoading } = useGetUserMeQuery();

    useEffect(() => {
        // Redirect to login if user is not authenticated
        if (!isLoading && (!data?.success || !data?.data?.user)) {
            router.push("/login");
            return;
        }

        if (!id) {
            router.replace("/settings?tab=subscribe");
        }
    }, [id, router, isLoading, data]);

    // Show loading while checking authentication
    if (isLoading) {
        return <FullscreenLoader />;
    }

    // Show loading or redirect if authentication failed
    if (!data?.success || !data?.data?.user) {
        return <FullscreenLoader />;
    }

    if (!id) {
        return null;
    }

    return (
        <MainLayout headerClassName="border-b border-slate-border-color bg-white">
            <div className="min-h-screen bg-white">
                <SubscriptionDetailPage subscriptionId={id} />
            </div>
        </MainLayout>
    );
}

export default function SubscriptionDetailRoute() {
    const tCommon = useTranslations("Common");
    return (
        <section className="min-h-screen bg-white">
            <Suspense fallback={<div className="flex justify-center items-center min-h-screen">{tCommon("loading")}</div>}>
                <SubscriptionDetailContent />
            </Suspense>
        </section>
    );
}
