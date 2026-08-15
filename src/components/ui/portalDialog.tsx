"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import FixedPortal from "@/components/ui/fixedPortal";
import Backdrop from "./backdrop";

interface PortalDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  width?: string | number;
  zIndexBackdrop?: number;
  zIndexDialog?: number;
  className?: string;
  bodyClass?: string;
  contentClass?: string;
  closeButtonClass?: string;
  showCloseButton?: boolean;
  isShow: boolean;
  animationType?: "center" | "";
  onClose: () => void;
  transitionDuration?: number;
  noBackdrop?: boolean;
}

export default function PortalDialog({
  children,
  title,
  description,
  width = 550,
  zIndexBackdrop = 50,
  zIndexDialog = 60,
  className,
  bodyClass = "",
  contentClass = "",
  closeButtonClass = "",
  showCloseButton = true,
  onClose,
  isShow,
  animationType = "",
  transitionDuration = 500,
  noBackdrop = false,
}: PortalDialogProps) {
  const [active, setActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIsShowRef = useRef<boolean | null>(null);

  const handleClose = useCallback(() => {
    setActive(false);
    timerRef.current = setTimeout(onClose, transitionDuration);
  }, [onClose, transitionDuration]);

  // Sync animation state
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const wasOpen = prevIsShowRef.current;
    prevIsShowRef.current = isShow;

    if (isShow && !wasOpen) {
      requestAnimationFrame(() => setActive(true));
    }

    if (!isShow && wasOpen) {
      requestAnimationFrame(() => setActive(false));
    }
  }, [isShow]);

  // ESC handling ONLY
  useEffect(() => {
    if (!isShow) return;

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isShow, handleClose]);

  if (!isShow && !active) return null;

  return (
    <FixedPortal>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: zIndexBackdrop }}
      >
        <Backdrop
          isOpen={active}
          onClose={handleClose}
          zIndex={zIndexBackdrop}
          transitionDuration={transitionDuration}
          className={`${noBackdrop ? "bg-transparent backdrop-blur-none" : "backdrop-blur-sm"}`}
        />

        <div
          className={cn(
            "relative w-full bg-white shadow-2xl rounded-xl transition-all overflow-hidden",
            animationType === "center"
              ? active
                ? "opacity-100"
                : "opacity-0"
              : active
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-[150vh]",
            className
          )}
          style={{
            maxWidth: typeof width === "number" ? `${width}px` : width,
            zIndex: zIndexDialog,
            transitionDuration: `${transitionDuration}ms`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn(
              "relative p-6 max-h-[75vh] overflow-y-auto",
              bodyClass
            )}
          >
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={cn(
                  "absolute right-2 top-2 p-2 rounded-full hover:bg-gray-100",
                  closeButtonClass
                )}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}

            {(title || description) && (
              <div className="mb-4 pr-10">
                {title && <h2 className="text-xl font-bold">{title}</h2>}
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            )}

            <div className={contentClass}>{children}</div>
          </div>
        </div>
      </div>
    </FixedPortal>
  );
}

// Sub-components stay essentially the same
export function DialogHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}
