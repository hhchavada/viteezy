"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuestMagicLinkDialogProps {
  open: boolean;
  email?: string | null;
  onOpenChange: (open: boolean) => void;
}

export default function GuestMagicLinkDialog({
  open,
  email,
  onOpenChange,
}: GuestMagicLinkDialogProps) {
  const t = useTranslations("Recommendations");
  const trimmedEmail = email?.trim() || null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl border-2 border-[#23B299] p-0 sm:max-w-2xl [&>button]:top-5 [&>button]:right-5 [&>button]:flex [&>button]:size-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-[#E3E3DC] [&>button]:bg-white [&>button]:opacity-100 [&>button]:shadow-sm hover:[&>button]:bg-[#F7F7F7] [&>button>svg]:size-5 [&>button>svg]:text-[#4A4A4A]">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#23B299]" aria-hidden />

        <div className="flex gap-5 px-7 py-7 pr-16 sm:gap-6 sm:px-8 sm:py-8 sm:pr-20">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#23B299] text-white shadow-sm sm:size-16">
            <Mail className="size-6 sm:size-7" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-[#E8F8F5] px-3 py-1 font-saans text-xs font-semibold uppercase tracking-wide text-[#1A8F7A]">
              {t("magicLinkBadge")}
            </span>
            <DialogTitle className="mt-3 font-saans text-xl font-semibold text-black-color sm:text-2xl">
              {t("magicLinkTitle")}
            </DialogTitle>
            <DialogDescription className="mt-3 font-saans text-base leading-7 text-[#4A4A4A] sm:text-lg">
              {t("magicLinkLead")}{" "}
              {trimmedEmail ? (
                <span className="font-semibold break-all text-[#1A8F7A]">
                  {trimmedEmail}
                </span>
              ) : (
                t("magicLinkEmailFallback")
              )}
              . {t("magicLinkTrail")}
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
