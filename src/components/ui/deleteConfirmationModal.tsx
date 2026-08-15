"use client";

import React, { useEffect, useState } from "react";
import Backdrop from "./backdrop";
import FixedPortal from "@/components/ui/fixedPortal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  zIndexBackdrop?: number;
  zIndexDialog?: number;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  itemName,
  confirmText = "Delete",
  cancelText = "Cancel",
  zIndexBackdrop = 30,
  zIndexDialog = 40,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsMounted(true);

        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      requestAnimationFrame(() => {
        setIsVisible(false);

        const timer = setTimeout(() => {
          setIsMounted(false);
        }, 300);

        return () => clearTimeout(timer);
      });
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Don't render anything if not mounted
  if (!isMounted) {
    return null;
  }

  return (
    <FixedPortal>
      {/* Backdrop with fade animation */}
      <Backdrop isOpen={isOpen} onClose={onClose} zIndex={zIndexBackdrop} />

      {/* Dialog Content with scale and fade animation */}
      <div
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl px-4"
        style={{
          zIndex: zIndexDialog,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`
            bg-white shadow-2xl rounded-xl md:rounded-[20px] p-6
            
            ${
              isVisible
                ? "opacity-100 scale-100 transition-all duration-200 "
                : "opacity-0 scale-95 "
            }
          `}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="sm:text-[17px] text-gray-700 font-medium">
              {message}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="elevate"
              size="elevate-md"
              className="font-semibold"
              onClick={onClose}
              animateText
            >
              {cancelText}
            </Button>
            <Button
              variant="elevate"
              size="elevate-md"
              className="font-semibold bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
              animateText
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </FixedPortal>
  );
};

export default DeleteConfirmationModal;
