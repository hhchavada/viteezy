"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "@/components/ui/input";
import SelectField from "@/components/ui/select";
import { CheckboxField } from "@/components/ui/inputs";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark } from "lucide-react";
import PhoneNumberInput from "@/components/ui/phoneNumberInput";
import { useTranslations } from "next-intl";
import {
  createAddressValidationSchema,
  AddressFormData as ValidationAddressFormData,
} from "@/hooks/useAddressValidation";
import { cn } from "@/lib/utils";

// Export the same type from validation hook
export type AddressFormData = ValidationAddressFormData;

interface AddressFormProps {
  mode: "add" | "edit";
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showSaveCheckbox?: boolean;
  submitButtonText?: string;
  showCancelButton?: boolean;
  isCheckoutLoading?: boolean;
  isValidating?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showSaveCheckbox = false,
  submitButtonText,
  showCancelButton = true,
  isCheckoutLoading = false,
  isValidating = false,
}) => {
  const t = useTranslations("Checkout");
  const defaultCountryCode = "+31";
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
      phone: defaultCountryCode,
      country: "",
      city: "",
      isDefault: false,
      note: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        streetName: initialData.streetName || "",
        houseNumber: initialData.houseNumber || "",
        houseNumberAddition: initialData.houseNumberAddition || "",
        postalCode: initialData.postalCode || "",
        address: initialData.address || "",
        phone: initialData.phone || defaultCountryCode,
        country: initialData.country || "",
        city: initialData.city || "",
        isDefault: initialData.isDefault === true,
        note: initialData.note || "",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        streetName: "",
        houseNumber: "",
        houseNumberAddition: "",
        postalCode: "",
        address: "",
        phone: defaultCountryCode,
        country: "",
        city: "",
        isDefault: false,
        note: "",
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: AddressFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* Two-column grid: full width on mobile, 50/50 on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder={t("firstNamePlaceholder")}
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
              placeholder={t("lastNamePlaceholder")}
              error={errors.lastName?.message}
            />
          )}
        />

        {/* Street Name - Full Width */}
        <div className="col-span-1 sm:col-span-2">
          <Controller
            name="streetName"
            control={control}
            render={({ field }) => (
              <InputField
                name={field.name}
                type="text"
                value={field.value}
                onChange={field.onChange}
                placeholder={t("streetNamePlaceholder")}
                error={errors.streetName?.message}
              />
            )}
          />
        </div>

        {/* House Number */}
        <Controller
          name="houseNumber"
          control={control}
          render={({ field }) => (
            <InputField
              name={field.name}
              type="text"
              value={field.value}
              onChange={field.onChange}
              placeholder={t("houseNumberPlaceholder")}
              error={errors.houseNumber?.message}
            />
          )}
        />

        {/* House Number Addition */}
        <Controller
          name="houseNumberAddition"
          control={control}
          render={({ field }) => (
            <InputField
              name={field.name}
              type="text"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder={t("houseNumberAdditionOptionalPlaceholder")}
              error={errors.houseNumberAddition?.message}
            />
          )}
        />

        {/* Address - Full Width */}
        <div className="col-span-1 sm:col-span-2">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <InputField
                name={field.name}
                type="text"
                value={field.value}
                onChange={field.onChange}
                placeholder={t("addressPlaceholder")}
                error={errors.address?.message}
              />
            )}
          />
        </div>

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
              placeholder={t("postalCodePlaceholder")}
              error={errors.postalCode?.message}
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
              placeholder={t("phonePlaceholder")}
              error={errors.phone?.message}
              touched={fieldState.isTouched}
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
              error={errors.country?.message}
            >
              <option value="">{t("selectCountry")}</option>
              <option value="NL">{t("countryNetherlands")}</option>
              <option value="IN">{t("countryIndia")}</option>
              <option value="US">{t("countryUnitedStates")}</option>
              <option value="GB">{t("countryUnitedKingdom")}</option>
              <option value="DE">{t("countryGermany")}</option>
              <option value="FR">{t("countryFrance")}</option>
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
              placeholder={t("cityPlaceholder")}
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
                placeholder={t("noteOptionalPlaceholder")}
                rows={3}
                className={cn(
                  "w-full rounded-[12px] border bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 resize-none placeholder:text-base",
                  errors.note
                    ? "border-red-500 focus:ring-red-500"
                    : "border-extra-light-gray focus:ring-teal-500"
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

      {/* Save Info Checkbox - Only show if showSaveCheckbox is true */}
      {showSaveCheckbox && (
        <div>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <CheckboxField
                name={field.name}
                id="saveInfo"
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
                label={t("saveInfoForNextTime")}
                error={errors.isDefault?.message}
              />
            )}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div
        className={`flex flex-col sm:flex-row gap-3 mt-6 ${
          showCancelButton ? "" : "justify-center"
        }`}
      >
        <Button
          type="submit"
          variant="tealElevate"
          size={showCancelButton ? "elevate-md" : "elevate"}
          className={showCancelButton ? "w-full sm:w-auto" : "w-full"}
          animateText
          disabled={isLoading || isCheckoutLoading || isValidating}
        >
          {isLoading
            ? t("processing")
            : isCheckoutLoading
            ? t("loadingCheckout")
            : isValidating
            ? t("validatingCart")
            : submitButtonText ||
              (mode === "edit" ? t("updateAddress") : t("saveAddress"))}
        </Button>
        {showCancelButton && (
          <Button
            type="button"
            variant="elevate"
            size="elevate-md"
            className="w-full sm:w-auto"
            onClick={onCancel}
            animateText
          >
            {t("cancel")}
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
