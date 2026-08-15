"use client";

import { useCallback, useState, useEffect } from "react";
import { useToggleWishlistMutation } from "@/store/api/wishlistApi";
import { useRouter } from "next/navigation";

export function useWishlist(
  productId?: string,
  initialIsLiked: boolean = false,
  currentProductIsLiked?: boolean
) {
  const router = useRouter();
  const [toggleWishlistMutation, { isLoading }] = useToggleWishlistMutation();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleAction = useCallback(
    async (id: string, forceStatus?: number) => {
      if (!id) return;

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!token) return router.push("/login");

      // Use current product is_liked value if available, otherwise use internal state
      const actualCurrentIsLiked = currentProductIsLiked !== undefined ? currentProductIsLiked : isLiked;
      
      // Use current isLiked state to determine the status to send
      const statusToSend = forceStatus !== undefined ? forceStatus : actualCurrentIsLiked ? 1 : 0;
      const nextLikedState = forceStatus !== undefined ? forceStatus === 0 : !actualCurrentIsLiked;

      console.log('Wishlist Debug:', { 
        productId: id, 
        currentProductIsLiked: actualCurrentIsLiked,
        internalIsLiked: isLiked,
        statusToSend, 
        nextLikedState, 
        forceStatus 
      });

      setIsLiked(nextLikedState);

      try {
        await toggleWishlistMutation({
          productId: id,
          status: statusToSend,
        }).unwrap();
      } catch {
        setIsLiked(!nextLikedState);
      }
    },
    [isLiked, currentProductIsLiked, router, toggleWishlistMutation]
  );

  return {
    isLiked,
    isLoading,
    toggleWishlist: productId ? () => handleAction(productId) : undefined,
    addToWishlist: productId ? () => handleAction(productId, 1) : undefined,
    removeFromWishlist: productId
      ? () => handleAction(productId, 0)
      : undefined,
    toggleWithId: (id: string) => handleAction(id),
  };
}
