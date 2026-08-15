"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PortalDialog from "@/components/ui/portalDialog";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/input";
import { TextareaField } from "@/components/ui/inputs";
import { formatDateWithTranslation } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCreatePostponementMutation } from "@/store/api/subscriptionApi";
import { useTranslations } from "next-intl";

const REASON_MAX_LENGTH = 200;

interface AddPostponementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  /** Shown as "Current Delivery Date" (e.g. initialDeliveryDate) */
  currentDeliveryDate: string;
  subscriptionId: string;
  onSuccess?: () => void;
}

/** Format date for API: YYYY-MM-DD */
function toApiDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Minimum selectable date for New Delivery Date: today (YYYY-MM-DD) */
function getTodayAsMinDate(): string {
  return toApiDate(new Date().toISOString());
}

export default function AddPostponementModal({
  isOpen,
  onClose,
  orderId,
  currentDeliveryDate,
  onSuccess,
}: AddPostponementModalProps) {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const tMonths = useTranslations("Months");
  const [createPostponement, { isLoading }] = useCreatePostponementMutation();

  const minDate = getTodayAsMinDate();

  const validationSchema = useMemo(
    () =>
      yup.object({
        requestedDeliveryDate: yup
          .string()
          .required(t("newDeliveryDateRequired"))
          .test(
            "not-past",
            t("newDeliveryDateCannotBePast"),
            (value) => {
              if (!value) return false;
              return value >= minDate;
            }
          ),
        reason: yup
          .string()
          .max(
            REASON_MAX_LENGTH,
            t("reasonMaxCharacters", { count: REASON_MAX_LENGTH })
          )
          .default(""),
      }),
    [minDate]
  );

  type FormData = yup.InferType<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      requestedDeliveryDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) reset({ requestedDeliveryDate: "", reason: "" });
  }, [isOpen, reset]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!orderId) {
        toast.error(t("unableSubmitOrderMissing"));
        return;
      }
      const apiDate = toApiDate(data.requestedDeliveryDate);
      if (!apiDate) {
        toast.error(t("invalidDate"));
        return;
      }
      try {
        await createPostponement({
          orderId,
          requestedDeliveryDate: apiDate,
          reason: data.reason?.trim() || undefined,
        }).unwrap();
        reset();
        onSuccess?.();
        onClose();
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        const message =
          error?.data?.message ||
          error?.message ||
          t("failedSubmitPostponementRequest");
        toast.error(message);
      }
    },
    [orderId, createPostponement, onSuccess, onClose, reset]
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      reset();
      onClose();
    }
  }, [onClose, isLoading, reset]);

  return (
    <PortalDialog
      isShow={isOpen}
      onClose={handleClose}
      width={940}
      showCloseButton={false}
      bodyClass="p-0"
      contentClass="rounded-xl overflow-hidden"
      title=""
    >
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-extra-light-gray">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("deliveryPostponement")}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50 border"
            aria-label={tCommon("close")}
          >
            <X className="w-6.5 h-6.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Current Delivery Date (read-only) */}
            <InputField
              label={t("currentDeliveryDate")}
              type="text"
              value={formatDateWithTranslation(currentDeliveryDate, "DD-MM-YYYY", tMonths)}
              onChange={() => {}}
              readOnly
              floating={false}
              className="bg-gray-50 text-gray-700 cursor-not-allowed"
            />

            {/* New Delivery Date */}
            <Controller
              name="requestedDeliveryDate"
              control={control}
              render={({ field }) => (
                <InputField
                  label={t("newDeliveryDate")}
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={minDate}
                  floating={false}
                  error={errors.requestedDeliveryDate?.message}
                />
              )}
            />
          </div>

          {/* Reason */}
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextareaField
                label={t("reasonForPostponement")}
                value={field.value}
                onChange={(e) =>
                  field.onChange(e.target.value.slice(0, REASON_MAX_LENGTH))
                }
                placeholder={t("reasonForPostponementPlaceholder")}
                rows={7}
                maxLength={REASON_MAX_LENGTH}
                error={errors.reason?.message}
              />
            )}
          />

          {/* Submit - validation handles errors; only disable while submitting */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="elevate"
              size="elevate-md"
              className="font-semibold bg-gray-900 hover:bg-gray-800"
              disabled={isLoading}
              animateText
            >
              {isLoading ? tCommon("submitting") : t("submitRequest")}
            </Button>
          </div>
        </form>
      </div>
    </PortalDialog>
  );
}
