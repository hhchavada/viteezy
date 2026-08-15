"use client";

import FixedPortal from "@/components/ui/fixedPortal";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface BlockingLoaderOverlayProps {
  open: boolean;
  message?: string;
  className?: string;
}

export default function BlockingLoaderOverlay({
  open,
  message,
  className,
}: BlockingLoaderOverlayProps) {
  if (!open) return null;

  return (
    <FixedPortal>
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm",
          className
        )}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4 px-6">
          <Spinner size="lg" color="white" />
          {message ? (
            <p className="text-center font-saans text-sm font-medium text-white sm:text-base">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </FixedPortal>
  );
}
