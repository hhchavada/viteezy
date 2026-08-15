"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export type OverlayCloseFunction = () => void;

class OverlayManager {
  private static instance: OverlayManager;
  private closeFunctions: Set<OverlayCloseFunction> = new Set();

  static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  register(closeFunction: OverlayCloseFunction): () => void {
    this.closeFunctions.add(closeFunction);
    
    // Return unregister function
    return () => {
      this.closeFunctions.delete(closeFunction);
    };
  }

  closeAll(): void {
    this.closeFunctions.forEach(closeFunction => {
      try {
        closeFunction();
      } catch (error) {
        console.error("Error closing overlay:", error);
      }
    });
  }

  clear(): void {
    this.closeFunctions.clear();
  }
}

/**
 * Custom hook to register overlay close functions that should be called on route changes
 * @param closeFunction - Function to close the overlay
 * @returns Cleanup function to unregister the overlay
 */
export function useOverlayCloseOnRouteChange(closeFunction: OverlayCloseFunction): () => void {
  const pathname = usePathname();
  const overlayManager = OverlayManager.getInstance();

  useEffect(() => {
    // Register the overlay close function
    const unregister = overlayManager.register(closeFunction);

    return unregister;
  }, [closeFunction, overlayManager]);

  useEffect(() => {
    // Close all overlays when pathname changes
    overlayManager.closeAll();
  }, [pathname, overlayManager]);

  // Return cleanup function
  return useCallback(() => {
    overlayManager.closeAll();
  }, [overlayManager]);
}

/**
 * Hook to manually close all registered overlays
 */
export function useCloseAllOverlays(): () => void {
  const overlayManager = OverlayManager.getInstance();
  
  return useCallback(() => {
    overlayManager.closeAll();
  }, [overlayManager]);
}

/**
 * Hook for components that need to listen to route changes
 */
export function useRouteChange(onRouteChange: (pathname: string) => void): void {
  const pathname = usePathname();
  
  useEffect(() => {
    onRouteChange(pathname);
  }, [pathname, onRouteChange]);
}
