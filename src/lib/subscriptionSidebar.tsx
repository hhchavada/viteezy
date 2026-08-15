"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SubscriptionSidebarContextValue = {
  isOpen: boolean;
  openSidebar: (cartId?: string) => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  cartId?: string;
};

const SubscriptionSidebarContext =
  createContext<SubscriptionSidebarContextValue | null>(null);

export function SubscriptionSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartId, setCartId] = useState<string | undefined>();

  const openSidebar = useCallback((id?: string) => {
    setCartId(id);
    setIsOpen(true);
  }, []);
  const closeSidebar = useCallback(() => {
    setCartId(undefined);
    setIsOpen(false);
  }, []);
  const toggleSidebar = useCallback(() => setIsOpen((p) => !p), []);

  const value = useMemo(
    () => ({ isOpen, openSidebar, closeSidebar, toggleSidebar, cartId }),
    [isOpen, openSidebar, closeSidebar, toggleSidebar, cartId],
  );

  return (
    <SubscriptionSidebarContext.Provider value={value}>
      {children}
    </SubscriptionSidebarContext.Provider>
  );
}

export function useSubscriptionSidebar() {
  const ctx = useContext(SubscriptionSidebarContext);
  if (!ctx)
    throw new Error(
      "useSubscriptionSidebar must be used within SubscriptionSidebarProvider",
    );
  return ctx;
}
