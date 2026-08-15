"use client";

import PortalDialog from "@/components/ui/portalDialog";
import { X } from "lucide-react";
import ProductDetailsContent from "@/components/products/ProductDetailsContent";
import { useTranslations } from "next-intl";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  /** When set (subscription change order), show sachet price for this plan length. */
  cycleDays?: number;
}

const ProductDetailModal = ({
  isOpen,
  onClose,
  productId,
  cycleDays,
}: ProductDetailModalProps) => {
  const t = useTranslations("Common");
  return (
    <PortalDialog
      isShow={isOpen}
      onClose={onClose}
      showCloseButton={false}
      bodyClass="p-0 max-h-[80vh] static"
      noBackdrop
      animationType="center"
      className="max-w-[1200px]! 3xl:max-w-[1540px]!"
    >
      <div className="p-5 min-h-180">
        <button
          onClick={onClose}
          className="absolute top-4 right-6 border rounded-full p-2 cursor-pointer bg-white hover:bg-gray-100 transition-colors z-10"
          aria-label={t("close")}
        >
          <X className="w-6 h-6" />
        </button>
        <ProductDetailsContent
          productId={productId}
          mode="modal"
          planDays={cycleDays}
        />
      </div>
    </PortalDialog>
  );
};

export default ProductDetailModal;
