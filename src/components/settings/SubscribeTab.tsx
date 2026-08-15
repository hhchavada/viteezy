"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSubscriptionQuery } from "@/store/api/subscriptionApi";
import Plan from "../account/subscribe/Plan";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const SUBSCRIBE_PAGE_LIMIT = 12;

const SubscribeTab = () => {
  const tAccount = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetSubscriptionQuery({
    page,
    limit: SUBSCRIBE_PAGE_LIMIT,
  });

  const subscriptions = data?.data ?? [];
  const hasNext = data?.pagination?.hasNext ?? false;

  const handleViewDetails = (id: string) => {
    router.push(`/settings/subscription/${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="mt-7">
        {isLoading && subscriptions.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
          </div>
        ) : subscriptions.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-3 3xl:gap-5">
              {subscriptions.map((item, index) => (
                <Plan
                  key={item.id ?? index}
                  data={item}
                  mode="list"
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
            {hasNext && (
              <div className="flex justify-center mt-10">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="min-w-[140px] inline-flex items-center justify-center gap-2"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading || isFetching}
                >
                  {isLoading || isFetching ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      {tCommon("loading")}
                    </>
                  ) : (
                    tCommon("loadMore")
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500">
            {tAccount("noActiveSubscriptions")}
          </span>
        )}
      </div>
    </div>
  );
};

export default SubscribeTab;
