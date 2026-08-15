"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Custom hook for managing modal state that automatically closes on route changes
 * @param initialState - Initial modal state (default: false)
 * @returns [isOpen, openModal, closeModal, toggleModal] - Modal state and control functions
 */
export function useModalWithRouteClose(initialState = false): [
  boolean,
  () => void,
  () => void,
  () => void
] {
  const [isOpen, setIsOpen] = useState(initialState);
  const pathname = usePathname();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  // Close modal on route change
  useEffect(() => {
    if (isOpen) {
      closeModal();
    }
  }, [pathname, isOpen, closeModal]);

  return [isOpen, openModal, closeModal, toggleModal];
}

/**
 * Custom hook for managing dialog state that automatically closes on route changes
 * @param initialState - Initial dialog state (default: false)
 * @returns [isOpen, openDialog, closeDialog, toggleDialog] - Dialog state and control functions
 */
export function useDialogWithRouteClose(initialState = false): [
  boolean,
  () => void,
  () => void,
  () => void
] {
  return useModalWithRouteClose(initialState);
}
