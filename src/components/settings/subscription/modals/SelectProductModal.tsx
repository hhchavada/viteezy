"use client";

import { Button } from "@/components/ui/button";
import PortalDialog from "@/components/ui/portalDialog";
import { ChevronRight, X } from "lucide-react";
import FallbackImage from "@/components/ui/fallbackImage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductDetailModal from "./ProductDetailModal";
import {
  useGetSubscriptionProductsQuery,
  useGetSubscriptionProductsStatusQuery,
  useUpdateSubscriptionProductsMutation,
} from "@/store/api/subscriptionApi";
import CheckboxField from "@/components/ui/inputs/checkbox";
import Spinner from "@/components/ui/spinner";
import { toast } from "react-hot-toast";
import { useSubscriptionSidebar } from "@/lib/subscriptionSidebar";
import { useTranslations } from "next-intl";
import {
  getCurrencySymbol,
  isRemoteImageUrl,
  resolvePlanDaysDisplayPrice,
  resolveProductImageUrl,
} from "@/lib/utils";

/** API allows max 100; one larger request avoids many slow page fetches. */
const PAGE_SIZE = 100;

interface SelectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  /** Active subscription plan length in days (e.g. 30, 90, 180). */
  cycleDays?: number;
}

const SelectProductModal = ({
  isOpen,
  onClose,
  subscriptionId,
  cycleDays,
}: SelectProductModalProps) => {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const { openSidebar } = useSubscriptionSidebar();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data, isLoading, isFetching } = useGetSubscriptionProductsStatusQuery(
    {
      subscriptionId,
      page,
      limit: PAGE_SIZE,
    },
    { skip: !isOpen },
  );

  const {
    data: subscriptionProductsData,
    isSuccess: isSubscriptionProductsLoaded,
  } = useGetSubscriptionProductsQuery(subscriptionId, { skip: !isOpen });

  const orderedProductIds = useMemo(() => {
    const productsData = subscriptionProductsData?.data;
    const items = productsData?.nextCycle?.items?.length
      ? productsData.nextCycle.items
      : productsData?.currentCycle?.items?.length
        ? productsData.currentCycle.items
        : (productsData?.items ?? []);

    return items
      .map((item) => item.productId || item.product?._id)
      .filter((id): id is string => Boolean(id));
  }, [subscriptionProductsData]);

  const [updateSubscriptionProducts, { isLoading: isUpdating }] =
    useUpdateSubscriptionProductsMutation();

  // Pre-check products that are already in the subscription order (/products API)
  useEffect(() => {
    if (!isOpen || hasInitialized || !isSubscriptionProductsLoaded) return;

    setSelectedProductIds(orderedProductIds);
    setHasInitialized(true);
  }, [
    isOpen,
    hasInitialized,
    isSubscriptionProductsLoaded,
    orderedProductIds,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setSelectedProductIds([]);
      setHasInitialized(false);
      loadingMoreRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isFetching) {
      loadingMoreRef.current = false;
    }
  }, [isFetching]);

  const loadNextPage = useCallback(() => {
    if (loadingMoreRef.current || isFetching || !data?.pagination?.hasNext) {
      return;
    }
    loadingMoreRef.current = true;
    setPage((prev) => prev + 1);
  }, [data?.pagination?.hasNext, isFetching]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Load next page earlier so users rarely wait at the bottom.
    if (scrollTop + clientHeight >= scrollHeight - 160) {
      loadNextPage();
    }
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleUpdateProducts = async () => {
    try {
      const result = await updateSubscriptionProducts({
        subscriptionId,
        productIds: selectedProductIds,
      }).unwrap();
      toast.success(t("subscriptionProductsUpdatedSuccess"));
      onClose();
      openSidebar(result.data.cartId);
    } catch (error) {
      toast.error(t("failedUpdateSubscriptionProducts"));
    }
  };

  const handleOpenDetailModal = (productId: string) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductId(null);
  };

  const products = data?.data || [];
  const isInitializingSelection =
    isOpen && !hasInitialized && !isSubscriptionProductsLoaded;
  const isLoadingMore = isFetching && page > 1;

  return (
    <PortalDialog
      animationType="center"
      isShow={isOpen}
      onClose={onClose}
      showCloseButton={false}
      width={680}
      bodyClass="p-0 max-h-[85vh] sm:max-h-auto "
    >
      <div className="">
        <div className="flex justify-between items-center px-5 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl 3xl:text-2xl font-medium">
            {t("selectProduct")}
          </h2>
          <button
            onClick={onClose}
            aria-label={tCommon("close")}
            className="border rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="sm:h-[calc(55vh-30px)] 3xl:h-[55vh] max-h-[400px] sm:max-h-[500px] overflow-y-auto py-5"
        >
          {(isLoading && page === 1) || isInitializingSelection ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <Spinner size="lg" text={t("loadingProducts")} />
            </div>
          ) : (
            <>
              {products.map((product) => {
                const imageUrl = resolveProductImageUrl(product);
                const planPrice = resolvePlanDaysDisplayPrice(
                  product,
                  cycleDays,
                );
                const symbol = getCurrencySymbol(planPrice.currency);
                const priceLabel = `${symbol}${planPrice.amount.toFixed(2)}`;

                return (
                  <div
                    key={product._id}
                    className="flex items-center justify-between px-5 cursor-pointer bg-white hover:bg-neutral-50 py-2.5 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      >
                        <CheckboxField
                          name={`product-${product._id}`}
                          checked={selectedProductIds.includes(product._id)}
                          onChange={() => handleToggleProduct(product._id)}
                        />
                      </div>
                      <div
                        className="flex items-center gap-4 flex-1 min-w-0"
                        onClick={() => handleOpenDetailModal(product._id)}
                      >
                        <div className="relative w-[60px] h-[60px] rounded-lg overflow-hidden bg-neutral-sand-100 shrink-0">
                          <FallbackImage
                            src={imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                            unoptimized={isRemoteImageUrl(imageUrl)}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="font-medium break-words whitespace-normal">
                            {product.title}
                          </h4>
                          <p className="font-medium text-sm block md:hidden mt-0.5">
                            {priceLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-3 shrink-0 ml-2"
                      onClick={() => handleOpenDetailModal(product._id)}
                    >
                      <p className="font-medium 3xl:text-lg hidden md:block">
                        {priceLabel}
                      </p>
                      <ChevronRight />
                    </div>
                  </div>
                );
              })}
              {isLoadingMore && (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <Spinner size="sm" />
                  <p className="text-sm text-gray-500 font-medium">
                    {t("loadingMoreProducts")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end gap-2.5 px-5 py-4 border-t sticky bottom-0 bg-white">
          <Button
            variant="elevate"
            size="elevate-md"
            className="px-6 h-11 xl:h-auto"
            onClick={onClose}
            disabled={isUpdating}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="tealElevate"
            size="elevate-md"
            className="px-6 h-11 sm:h-auto min-w-[140px]"
            onClick={handleUpdateProducts}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Spinner size="xs" color="white" />
            ) : (
              t("updateProducts")
            )}
          </Button>
        </div>
      </div>
      {selectedProductId && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          productId={selectedProductId}
          cycleDays={cycleDays}
        />
      )}
    </PortalDialog>
  );
};

export default SelectProductModal;
