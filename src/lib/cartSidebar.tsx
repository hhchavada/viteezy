"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useOverlayCloseOnRouteChange } from "@/hooks/useOverlayCloseOnRouteChange";

type CartSidebarContextValue = {
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
};

const CartSidebarContext = createContext<CartSidebarContextValue | null>(null);

export function CartSidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen((p) => !p), []);

    // Close cart on route change
    useOverlayCloseOnRouteChange(closeCart);

    const value = useMemo(
        () => ({ isOpen, openCart, closeCart, toggleCart }),
        [isOpen, openCart, closeCart, toggleCart]
    );

    return <CartSidebarContext.Provider value={value}>{children}</CartSidebarContext.Provider>;
}

export function useCartSidebar() {
    const ctx = useContext(CartSidebarContext);
    if (!ctx) throw new Error("useCartSidebar must be used within CartSidebarProvider");
    return ctx;
}
