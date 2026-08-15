"use client";

import { Button } from "@/components/ui/button";
import PortalDialog from "@/components/ui/portalDialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ChooseProductProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: () => void;
  onTakeQuiz: () => void;
}

const ChooseProductProcessModal = ({
  isOpen,
  onClose,
  onBuyNow,
  onTakeQuiz,
}: ChooseProductProcessModalProps) => {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  return (
    <PortalDialog
      title=""
      isShow={isOpen}
      onClose={onClose}
      width={550}
      showCloseButton={false}
      bodyClass="p-0"
      animationType="center"
    >
      <div className="relative">
        <div className="flex justify-between items-center px-5 py-4">
          <h2 className="text-xl 3xl:text-2xl font-medium">
            {t("chooseHowToProceed")}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label={tCommon("close")}
          className="absolute top-4 right-4 border rounded-full p-2 cursor-pointer bg-white hover:bg-gray-100"
        >
          <X className="h-5 3xl:h-6 w-5 3xl:w-6" />
        </button>
        <hr />
        <div className="p-5">
          <p className=" text-center text-lg font-medium">
            {t("selectOptionToChangeProduct")}
          </p>
          <div className="mt-3 flex gap-3">
            <Button
              onClick={onBuyNow}
              className="flex-1 3xl:py-6.5"
              variant="elevate"
              size="elevate-md"
              animateText
              >
              {t("buyNow")}
            </Button>
            <Button
              onClick={onTakeQuiz}
              className="flex-1 3xl:py-6.5"
              variant="tealElevate"
              size="elevate-md"
              animateText
            >
              {t("takeQuiz")}
            </Button>
          </div>
        </div>
      </div>
    </PortalDialog>
  );
};

export default ChooseProductProcessModal;
