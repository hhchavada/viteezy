"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLazyGetOrderByIdQuery } from "@/store/api/orderApi";
import type { GetOrderByIdResponse } from "@/store/api/types/order.types";
import OrderConfirmationHeader from "./OrderConfirmationHeader";
import OrderDetailsSection from "./OrderDetailsSection";
import WhatHappensNext from "./WhatHappensNext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Fetch order by ID using token only for this request (no localStorage). */
async function fetchOrderWithToken(
  orderId: string,
  token: string
): Promise<GetOrderByIdResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
  if (!res.ok) {
    const err = new Error(res.statusText || "Failed to load order");
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export default function OrderConfirmedPage() {
  const t = useTranslations("OrderConfirmed");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const tokenFromUrl = searchParams.get("token");

  const [getOrderById, { data: orderDataFromApi, isLoading: isLoadingApi, error: errorApi }] =
    useLazyGetOrderByIdQuery();

  const [orderDataFromFetch, setOrderDataFromFetch] = useState<GetOrderByIdResponse | null>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [errorFetch, setErrorFetch] = useState<Error | null>(null);

  const fetchWithToken = useCallback(async () => {
    if (!orderId || !tokenFromUrl) return;
    setIsLoadingFetch(true);
    setErrorFetch(null);
    try {
      const data = await fetchOrderWithToken(orderId, tokenFromUrl);
      setOrderDataFromFetch(data);
    } catch (err) {
      setErrorFetch(err instanceof Error ? err : new Error("Failed to load order"));
    } finally {
      setIsLoadingFetch(false);
    }
  }, [orderId, tokenFromUrl]);

  useEffect(() => {
    if (!orderId) return;
    if (tokenFromUrl) {
      fetchWithToken();
    } else {
      getOrderById(orderId);
    }
  }, [orderId, tokenFromUrl, getOrderById, fetchWithToken]);

  const useTokenFlow = Boolean(tokenFromUrl);
  const orderData = useTokenFlow ? orderDataFromFetch : orderDataFromApi;
  const isLoading = useTokenFlow ? isLoadingFetch : isLoadingApi;
  const error = useTokenFlow ? errorFetch : errorApi;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white-color flex items-center justify-center">
        <p className="text-lg text-gray-500">{t("loadingOrderDetails")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-off-white-color flex items-center justify-center">
        <p className="text-lg text-red-500">
          {t("errorLoadingOrderDetails")}
        </p>
      </div>
    );
  }

  const order = orderData?.data?.order || null;

  if (!order) {
    return (
      <div className="min-h-screen bg-off-white-color flex items-center justify-center">
        <p className="text-lg text-gray-500">{t("noOrderDataAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white-color">
      <OrderConfirmationHeader orderData={order} />
      <OrderDetailsSection orderData={order} />
      <WhatHappensNext orderData={order} />
    </div>
  );
}
