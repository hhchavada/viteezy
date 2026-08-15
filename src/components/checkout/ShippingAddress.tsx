"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateAddressMutation, useGetAddressesQuery } from "@/store/api/addressApi";
import { AddressFormData } from "@/hooks/useAddressValidation";
import AddressForm from "./AddressForm";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { getLoggedInUserEmail } from "@/lib/utils";
import { getApiErrorFromUnknown } from "@/lib/apiError";

interface ShippingAddressProps {
  isCheckoutLoading?: boolean;
  isValidating?: boolean;
}

const ShippingAddress: React.FC<ShippingAddressProps> = ({
  isCheckoutLoading = false,
  isValidating = false,
}) => {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const [createAddress, { isLoading: isCreating }] =
    useCreateAddressMutation();
  const { refetch: refetchAddresses } = useGetAddressesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleSubmit = async (data: AddressFormData) => {
    try {
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
      
      // After successful address creation, refetch addresses and refresh the page
      await refetchAddresses();
      
      // Show success toast and refresh the checkout page to show the new address
      toast.success(t("addressAddedSuccessfully"));
      
      // Refresh the page to show the UserAddresses component with the new address
      router.refresh();
    } catch (error) {
      console.error("Failed to create address:", error);
      toast.error(
        getApiErrorFromUnknown(error, {
          fallback: t("failedToSaveAddress"),
        })
      );
    }
  };

  return (
    <div className="rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("shippingAddress")}
        </h2>
      </div>

      <AddressForm
        mode="add"
        onSubmit={handleSubmit}
        onCancel={() => {}}
        isLoading={isCreating}
        showSaveCheckbox={false}
        submitButtonText={t("btnAddAddress")}
        showCancelButton={false}
        isCheckoutLoading={isCheckoutLoading}
        isValidating={isValidating}
      />
    </div>
  );
};

export default ShippingAddress;
