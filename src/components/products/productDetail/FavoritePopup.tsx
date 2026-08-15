"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CrossIcon, YesWithTeal } from "@/components/icons";
import FallbackImage from "@/components/ui/fallbackImage";
import { Product } from "@/components/types";
import { useRouter } from "next/navigation";
import { routes } from "@/components/constants/route";
import { useTranslations } from "next-intl";
import Backdrop from "@/components/ui/backdrop";
import { getCurrencySymbol } from "@/lib/utils";

interface FavoritePopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritePopup({
  product,
  isOpen,
  onClose,
}: FavoritePopupProps) {
  const router = useRouter();
  const t = useTranslations("Products");

  const capsuleCount = (() => {
    const match = product.description?.match(/\d+/);
    return match ? Number(match[0]) : null;
  })();

  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    router.push(routes.favorites);
  };

  return createPortal(
    <>
      {/* <div
        className="fixed inset-0 bg-black/20 z-[1000] transition-opacity"
        onClick={onClose}
      /> */}
      {/* Backdrop */}
      <Backdrop
        isOpen={isOpen}
        onClose={onClose}
        zIndex={1000}
        handleScrollLock={true}
        transitionDuration={300}
      />

      {/* Popup */}
      <div
        className={`fixed top-4 right-4 h-auto max-w-[90vw] sm:max-w-[420px] w-full bg-white radius-style shadow-2xl z-[1001] transform transition-all duration-300 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-3 pt-3 border-gray-200">
          <div className=" flex items-center justify-center">
            <YesWithTeal />
          </div>
          <h2 className="text-base font-medium flex-1 3xl:text-lg">
            {t("addedToFavorite")}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors border cursor-pointer border-charcol-color/10"
          >
            <CrossIcon />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <FallbackImage
                src={product.images.front}
                alt={product.name}
                width={120}
                height={120}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-medium text-base 3xl:text-lg">
                {product.name}
              </h3>
              <p className="text-sm mb-2 3xl:text-base line-clamp-2">
                {capsuleCount !== null
                  ? t("capsulesCount", { count: capsuleCount })
                  : product.description}
              </p>
              <p className="text-sm font-medium 3xl:text-lg">
                {getCurrencySymbol(product.currency)}
                {product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <button
            onClick={handleNavigate}
            className="w-full bg-charcol-color text-white py-3 rounded-full font-medium hover:bg-charcol-color/90 cursor-pointer 3xl:text-lg "
          >
            {t("viewFavorite")}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
