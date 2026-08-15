"use client";

import React, { memo, useState, useMemo } from "react";
import AccountNav from "../components/AccountNav";
import { Search, X } from "@/components/icons";
import InputField from "@/components/ui/input";
import OrderFilterNav from "./OrderFilterNav";
import { FilterType, Order } from "@/components/types/account";
import OrderItem from "./orderItem";
import { useGetOrdersQuery } from "@/store";
import { useLocale, useTranslations } from "next-intl";

const OrderHistory = () => {
  const tCommon = useTranslations("Common");
  const tAccount = useTranslations("Account");
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders from API
  const { data, isLoading, error } = useGetOrdersQuery();

  const orders: Order[] = useMemo(() => {
    const apiOrders = data?.data || [];
    const dateOpts: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const shortOpts: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const localizedOrderStatus = (status?: string) => {
      if (!status) return tAccount("orderStatusProcessing");
      const normalized = status.toLowerCase();
      if (normalized === "pending") return tAccount("orderStatusPending");
      if (normalized === "confirmed") return tAccount("orderStatusConfirmed");
      if (normalized === "processing") return tAccount("orderStatusProcessing");
      return status;
    };

    return apiOrders.map((apiOrder: any, index: number) => {
      const orderDateStr = apiOrder.createdAt
        ? new Date(apiOrder.createdAt).toLocaleDateString(locale, dateOpts)
        : tAccount("accountNotApplicable");
      const parsedOverall = Number(apiOrder.pricing?.overall);
      const normalizedTotal = Number.isFinite(parsedOverall)
        ? parsedOverall
        : 0;

      const isDelivered = apiOrder.status?.toLowerCase() === "delivered";
      const isPending = apiOrder.status?.toLowerCase() === "pending";
      const deliveryDateStr = isDelivered
        ? tAccount("deliveredOn", {
            date: new Date(
              apiOrder.deliveredAt || apiOrder.updatedAt || apiOrder.createdAt
            ).toLocaleDateString(locale, shortOpts),
          })
        : localizedOrderStatus(apiOrder.status);

      return {
        id: apiOrder.id || apiOrder._id || `order-${index}`,
        orderNumber: apiOrder.orderNumber || `#${apiOrder.id || index}`,
        orderDate: orderDateStr,
        total: normalizedTotal,
        currency: apiOrder.pricing?.currency,
        status: isDelivered
          ? ("delivered" as const)
          : isPending
            ? ("pending" as const)
            : ("active" as const),
        paymentMethod: apiOrder.paymentMethod,
        paymentStatus: apiOrder.paymentStatus,
        canPayAgain: apiOrder.canPayAgain === true,
        deliveryDate: deliveryDateStr,
        pricing: apiOrder.pricing,
        items: (apiOrder.items || []).map((item: any, itemIndex: number) => {
          const productTitle =
            item.productId?.title ||
            item.title ||
            item.name ||
            item.productName ||
            tAccount("unknownProduct");
          const productImage =
            item.productId?.productImage ||
            item.image ||
            item.productImage ||
            "/placeholder.png";
          const qty = item.quantity || item.capsuleCount || 1;
          const unit = item.variant || tAccount("quantityUnit");

          return {
            id:
              item.productId?._id ||
              item.productId ||
              item._id ||
              item.id ||
              `item-${itemIndex}`,
            name: productTitle,
            quantity: tAccount("orderItemQuantity", { count: qty, unit }),
            image: productImage,
          };
        }),
      };
    });
  }, [data?.data, locale, tAccount]);

  // Filter by search query first (before applying status filter)
  // Also filter items within each order to only show matching products
  const searchFilteredOrders = orders
    .map((order) => {
      if (!searchQuery) return order;

      const query = searchQuery.toLowerCase();

      // Search in order number
      const matchesOrderNumber = order.orderNumber
        .toLowerCase()
        .includes(query);

      // Filter items that match the search query
      const matchingItems = order.items.filter((item) =>
        item.name.toLowerCase().includes(query)
      );

      // If order number matches, return all items; otherwise only matching items
      if (matchesOrderNumber) {
        return order;
      } else if (matchingItems.length > 0) {
        // Return order with only matching items
        return {
          ...order,
          items: matchingItems,
        };
      }

      return null;
    })
    .filter((order): order is Order => order !== null);

  // Calculate counts based on search results (before applying status filter)
  const filterCounts = {
    all: searchFilteredOrders.length,
    active: searchFilteredOrders.filter(
      (o) => o.status === "active" || o.status === "pending"
    ).length,
    delivered: searchFilteredOrders.filter((o) => o.status === "delivered")
      .length,
  };

  // Then apply the active filter to display
  const searchedOrders = searchFilteredOrders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") {
      return order.status === "active" || order.status === "pending";
    }
    return order.status === activeFilter;
  });

  return (
    <div>
      <div>
        <AccountNav title={tCommon("orderHistory")} />

        {/* Filters and Search Section */}
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Filter Navigation */}
          <OrderFilterNav
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />

          {/* Search Bar */}
          <div className="relative w-full max-w-[500px]">
            <InputField
              floating={false}
              className="h-12 text-base rounded-lg ps-12 pr-12"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tAccount("searchOrdersPlaceholder")}
              preIcon={<Search className="h-5.5 w-5.5 text-gray-600" />}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={tCommon("clearSearch")}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg">{tAccount("loadingOrders")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">
            <p className="text-lg">{tAccount("errorLoadingOrders")}</p>
          </div>
        ) : searchedOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg">{tAccount("noOrdersForFilter")}</p>
          </div>
        ) : (
          searchedOrders.map((order, orderIndex) => (
            <OrderItem order={order} key={"order" + orderIndex} />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(OrderHistory);
