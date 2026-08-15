"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import PortalDialog from "@/components/ui/portalDialog";
import { Button } from "@/components/ui/button";

interface ContinueQuizModalProps {
  isOpen: boolean;
  isStartingNew?: boolean;
  onClose: () => void;
  onContinue: () => void;
  onStartNew: () => void;
}

export default function ContinueQuizModal({
  isOpen,
  isStartingNew = false,
  onClose,
  onContinue,
  onStartNew,
}: ContinueQuizModalProps) {
  const tQuiz = useTranslations("Quiz");
  const tCommon = useTranslations("Common");

  return (
    <PortalDialog
      isShow={isOpen}
      onClose={onClose}
      width={560}
      showCloseButton={false}
      bodyClass="p-0 max-h-[92vh] overflow-y-auto"
      className="overflow-hidden rounded-2xl"
      zIndexBackdrop={80}
      zIndexDialog={90}
      animationType="center"
    >
      <div className="rounded-t-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 bg-[#F7F6F0] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/quiz/save.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0"
              aria-hidden
            />
            <p className="font-saans text-sm font-medium text-black-color">
              {tQuiz("continueModalTitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isStartingNew}
            aria-label={tCommon("close")}
            className="cursor-pointer rounded-full p-1 text-black-color transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <h2 className="font-saans text-xl font-medium text-black-color sm:text-2xl">
          {tQuiz("continueModalHeading")}
        </h2>
        <p className="mt-3 font-saans text-sm leading-relaxed text-light-gray-color sm:text-base">
          {tQuiz("continueModalDescription")}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="elevate"
            size="elevate"
            className="w-full"
            onClick={onContinue}
            disabled={isStartingNew}
          >
            {tQuiz("continueQuiz")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full border-black-color py-6 font-saans text-sm font-medium text-black-color hover:bg-black/5"
            onClick={onStartNew}
            disabled={isStartingNew}
          >
            {isStartingNew ? tQuiz("starting") : tQuiz("startNewQuiz")}
          </Button>
        </div>
      </div>
    </PortalDialog>
  );
}
