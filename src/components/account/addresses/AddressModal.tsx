"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PortalDialog, { DialogHeader } from "@/components/ui/portalDialog";
import InputField from "@/components/ui/input";
import SelectField from "@/components/ui/select";
import { CheckboxField } from "@/components/ui/inputs";
import { Button } from "@/components/ui/button";
import PhoneNumberInput from "@/components/ui/phoneNumberInput";
import {
  createAddressValidationSchema,
  AddressFormData,
} from "@/hooks/useAddressValidation";
import { cn, getLoggedInUserEmail } from "@/lib/utils";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import {
  useCreateAddressMutation,
  useUpdateAddressMutation,
} from "@/store/api/addressApi";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

interface AddressModalProps {
  trigger: React.ReactNode;
  mode?: "add" | "edit";
  address?: AddressFormData & { _id?: string };
  isShow?: boolean;
  onClose?: () => void;
  showDefaultCheckbox?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  trigger,
  mode = "add",
  address,
  isShow,
  onClose,
  showDefaultCheckbox = true,
}) => {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const addressValidationSchema = useMemo(
    () =>
      createAddressValidationSchema({
        firstNameRequired: t("firstNameRequired"),
        firstNameMin: t("firstNameMin"),
        firstNameMax: t("firstNameMax"),
        lastNameRequired: t("lastNameRequired"),
        lastNameMin: t("lastNameMin"),
        lastNameMax: t("lastNameMax"),
        streetNameRequired: t("streetNameRequired"),
        streetNameMin: t("streetNameMin"),
        streetNameMax: t("streetNameMax"),
        houseNumberRequired: t("houseNumberRequired"),
        houseNumberMax: t("houseNumberMax"),
        houseNumberAdditionMax: t("houseNumberAdditionMax"),
        postalCodeRequired: t("postalCodeRequired"),
        postalCodeInvalid: t("postalCodeInvalid"),
        postalCodeMin: t("postalCodeMin"),
        postalCodeMax: t("postalCodeMax"),
        addressRequired: t("addressRequired"),
        addressMin: t("addressMin"),
        addressMax: t("addressMax"),
        phoneRequired: t("phoneRequired"),
        phoneInvalid: t("phoneInvalid"),
        countryRequired: t("countryRequired"),
        cityRequired: t("cityRequired"),
        cityMin: t("cityMin"),
        cityMax: t("cityMax"),
        noteMax: t("noteMax"),
      }),
    [t]
  );
  const [internalIsOpen, setIsInternalOpen] = useState(false);

  const countryLabels: Record<string, string> = {
    NL: t("countryNL"),
    IN: t("countryIN"),
    US: t("countryUS"),
    GB: t("countryGB"),
    DE: t("countryDE"),
    FR: t("countryFR"),
  };

  // Use controlled state if provided, otherwise use internal state
  const isOpen = isShow !== undefined ? isShow : internalIsOpen;

  const handleInternalOpen = () => {
    setIsInternalOpen(true);
  };
  const [createAddress, { isLoading: isCreating, reset: resetCreateAddressState }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating, reset: resetUpdateAddressState }] =
    useUpdateAddressMutation();

  const isLoading = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: yupResolver(addressValidationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      streetName: "",
      houseNumber: "",
      houseNumberAddition: "",
      postalCode: "",
      address: "",
      phone: "",
      country: "",
      city: "",
      isDefault: false,
      note: "",
    },
  });

  // Reset form when modal opens or address changes
  useEffect(() => {
    if (isOpen) {
      if (address && mode === "edit") {
        reset({
          firstName: address.firstName || "",
          lastName: address.lastName || "",
          streetName: address.streetName || "",
          houseNumber: address.houseNumber || "",
          houseNumberAddition: address.houseNumberAddition || "",
          postalCode: address.postalCode || "",
          address: address.address || "",
          phone: address.phone || "",
          country: address.country || "",
          city: address.city || "",
          isDefault: address.isDefault === true,
          note: address.note || "",
        });
      } else if (mode === "add") {
        reset({
          firstName: "",
          lastName: "",
          streetName: "",
          houseNumber: "",
          houseNumberAddition: "",
          postalCode: "",
          address: "",
          phone: "",
          country: "",
          city: "",
          isDefault: false,
          note: "",
        });
      }
    }
  }, [isOpen, address, mode, reset]);

  const onSubmit = async (data: AddressFormData) => {
    if (mode === "add") {
      try {
        // Format the data to match the expected API structure - only form fields
        const submitData = {
          firstName: data.firstName,
          lastName: data.lastName,
          streetName: data.streetName,
          houseNumber: data.houseNumber,
          houseNumberAddition: data.houseNumberAddition || "",
          postalCode: data.postalCode,
          address: data.address,
          phone: data.phone,
          country: data.country,
          city: data.city,
          isDefault: data.isDefault || false,
          note: data.note || "",
          email: getLoggedInUserEmail(),
        };

        await createAddress(submitData).unwrap();
        // Reset form and close modal on success
        reset();
        if (isShow === undefined) {
          setIsInternalOpen(false);
        } else if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error("Failed to create address:", error);
        toast.error(
          getApiErrorFromUnknown(error, {
            fallback: t("addressFormErrorFallback"),
          })
        );
      }
    } else if (mode === "edit" && address?._id) {
      try {
        // Format the data to match the expected API structure - only form fields
        const submitData = {
          firstName: data.firstName,
          lastName: data.lastName,
          streetName: data.streetName,
          houseNumber: data.houseNumber,
          houseNumberAddition: data.houseNumberAddition || "",
          postalCode: data.postalCode,
          address: data.address,
          phone: data.phone,
          country: data.country,
          city: data.city,
          isDefault: data.isDefault || false,
          note: data.note || "",
          email: getLoggedInUserEmail(),
        };

        await updateAddress({ id: address._id, data: submitData }).unwrap();
        // Close modal on success
        if (isShow === undefined) {
          setIsInternalOpen(false);
        } else if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error("Failed to update address:", error);
        toast.error(
          getApiErrorFromUnknown(error, {
            fallback: t("addressFormErrorFallback"),
          })
        );
      }
    }
  };

  const handleClose = () => {
    if (isShow === undefined) {
      setIsInternalOpen(false);
    }
    resetCreateAddressState();
    resetUpdateAddressState();
    reset();
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {trigger && isShow === undefined && (
        <div onClick={handleInternalOpen} className="cursor-pointer">
          {trigger}
        </div>
      )}
      <PortalDialog
        // title={mode === "edit" ? "Edit address" : "Add address"}
        width={900}
        contentClass="p-2.5"
        isShow={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        bodyClass="max-h-[80vh]"
      >
        <DialogHeader>
          <div className="flex justify-between items-center mb-9">
            <h2 className="text-3xl font-medium m-0">
              {mode === "edit" ? t("modalEditAddress") : t("modalAddAddress")}
            </h2>
            <button onClick={handleClose} aria-label={tCommon("close")} className="cursor-pointer">
              <X className="h-10 w-10 p-1.5 rounded-full border" />
            </button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
          {/* Two-column grid: full width on small screens, 50/50 on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("firstName")}
                  className="bg-gray-50 border-transparent"
                  error={errors.firstName?.message}
                />
              )}
            />

            {/* Last Name */}
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("lastName")}
                  className="bg-gray-50 border-transparent"
                  error={errors.lastName?.message}
                />
              )}
            />

            {/* Street Name  */}
            <Controller
              name="streetName"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("streetName")}
                  className="bg-gray-50 border-transparent"
                  error={errors.streetName?.message}
                />
              )}
            />

            {/* House Number and Addition */}
            <Controller
              name="houseNumber"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("houseNumber")}
                  className="bg-gray-50 border-transparent"
                  error={errors.houseNumber?.message}
                />
              )}
            />

            <Controller
              name="houseNumberAddition"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder={t("houseNumberAdditionOptional")}
                  className="bg-gray-50 border-transparent"
                  error={errors.houseNumberAddition?.message}
                />
              )}
            />

            {/* Postal Code */}
            <Controller
              name="postalCode"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("postalCodeField")}
                  className="bg-gray-50 border-transparent"
                  error={errors.postalCode?.message}
                />
              )}
            />

            {/* Address*/}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("addressLine")}
                  className="bg-gray-50 border-transparent"
                  error={errors.address?.message}
                />
              )}
            />

            {/* Phone */}
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneNumberInput
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t("phone")}
                  error={errors.phone?.message}
                  touched={fieldState.isTouched}
                  className="bg-gray-50 border-transparent"
                />
              )}
            />

            {/* Country */}
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <SelectField
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("selectCountry")}
                  className="bg-gray-50 border-transparent"
                  error={errors.country?.message}
                >
                  <option value="">{t("selectCountry")}</option>
                  {(["NL", "IN", "US", "GB", "DE", "FR"] as const).map((code) => (
                    <option key={code} value={code}>
                      {countryLabels[code]}
                    </option>
                  ))}
                </SelectField>
              )}
            />

            {/* City */}
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <InputField
                  name={field.name}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("cityField")}
                  className="bg-gray-50 border-transparent"
                  error={errors.city?.message}
                />
              )}
            />
          </div>

          {/* Note - Full Width Textarea */}
          <div className="w-full flex flex-col gap-1">
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <>
                  <textarea
                    {...field}
                    placeholder={t("noteOptional")}
                    rows={3}
                    className={cn(
                      "w-full rounded-[12px]  hover:outline-1 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 resize-none placeholder:text-base",
                      errors.note
                        ? "border-red-500 focus:ring-red-500"
                        : "border-extra-light-gray focus:ring-teal-500 outline-teal-500",
                    )}
                  />
                  {errors.note && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.note.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Default address checkbox */}
          {showDefaultCheckbox && (
            <div>
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    name={field.name}
                    id="isDefault"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    label={t("setAsDefaultAddress")}
                    error={errors.isDefault?.message}
                  />
                )}
              />
            </div>
          )}

          {/* Submit button - full width on mobile, centered on larger screens */}
          <div className="">
            <Button
              type="submit"
              size="elevate"
              variant="tealElevate"
              className=" font-medium"
              animateText
              disabled={isLoading}
            >
              {isLoading
                ? t("saving")
                : mode === "edit"
                  ? t("btnUpdateAddress")
                  : t("btnAddAddress")}
            </Button>
          </div>
        </form>
      </PortalDialog>
    </>
  );
};

export default AddressModal;
