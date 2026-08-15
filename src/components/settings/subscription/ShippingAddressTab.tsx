"use client";

import React, { useState } from "react";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
} from "@/store/api/addressApi";
import { useChangeShippingAddressMutation } from "@/store/api/subscriptionApi";
import { Address } from "@/store/api/types/addresses.types";
import { AddressFormData } from "@/hooks/useAddressValidation";
import AddressModal from "@/components/account/addresses/AddressModal";
import { Check, Dot, Home, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

interface ShippingAddressTabProps {
  subscriptionId: string;
  isTabActive: boolean;
}

function formatAddressLine(address: Address): string {
  const parts = [
    address.streetName,
    address.houseNumber,
    address.houseNumberAddition,
    address.address,
  ]
    .filter(Boolean)
    .join(" ");
  if (parts) return `${parts}, ${address.city}, ${address.postalCode}`;
  return address.address || `${address.city}, ${address.postalCode}`;
}

export default function ShippingAddressTab({
  isTabActive,
  subscriptionId,
}: ShippingAddressTabProps) {
  const t = useTranslations("Account");
  const { data, isLoading } = useGetAddressesQuery(
    { subscriptionId },
    {
      skip: !isTabActive,
    },
  );
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [changeShippingAddress, { isLoading: isChanging }] =
    useChangeShippingAddressMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const addresses: Address[] = data?.data?.addresses ?? [];
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isSelectedForSubscription && !b.isSelectedForSubscription) return -1;
    if (!a.isSelectedForSubscription && b.isSelectedForSubscription) return 1;
    return 0;
  });

  const handleOpenEdit = (e: React.MouseEvent, address: Address) => {
    e.stopPropagation();
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!confirm(t("deleteAddressConfirm"))) return;
    try {
      await deleteAddress(addressId).unwrap();
    } catch {
      // Error could be surfaced via toast if needed
    }
  };

  const handleChangeAddress = async (addressId: string) => {
    if (isChanging) return;
    try {
      await changeShippingAddress({
        subscriptionId,
        shippingAddressId: addressId,
      }).unwrap();
      toast.success(t("shippingAddressUpdatedSuccess"));
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || t("shippingAddressUpdateFailed"));
    }
  };

  if (!isTabActive) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="border rounded-2xl 3xl:rounded-3xl">
      <div className="flex items-center justify-between py-4 3xl:py-5 px-5 border-b">
        <h2 className="text-lg 3xl:text-[22px]  font-medium text-gray-900">
          {t("shippingAddressTitle")}
        </h2>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center font-medium text-teal-500 hover:text-teal-600 transition-colors cursor-pointer"
        >
          <Plus className="w-6 h-6 me-px" /> {t("newAddress")}
        </button>
      </div>

      <div className="p-5 3xl:p-7">
        {sortedAddresses.length === 0 ? (
          <div className="py-12 text-center text-gray-500 rounded-lg bg-slate-50 border border-slate-200">
            {t("noShippingAddressesYet")}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedAddresses.map((address) => (
              <div
                key={address._id}
                onClick={() =>
                  !address.isSelectedForSubscription &&
                  handleChangeAddress(address._id)
                }
                className={`rounded-xl border bg-white p-5 transition-colors relative overflow-hidden group ${
                  address.isSelectedForSubscription
                    ? "border-teal-500 ring-1 ring-teal-500/20 pt-9"
                    : "border-extra-light-gray cursor-pointer hover:border-teal-300"
                } ${isChanging ? "opacity-60 pointer-events-none" : ""}`}
              >
                {address.isSelectedForSubscription && (
                  <div>
                    <div className="flex flex-col items-center gap-2 absolute -top-1 -start-1">
                      <div className="w-7 h-7 rounded-br-md bg-teal-500 flex items-center justify-center">
                        <Check
                          className="w-3.5 h-3.5 mt-0.5 ms-0.5 text-white"
                          strokeWidth={4}
                        />
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs 3xl:text-base bg-[#DDF3F0] text-teal-500 mb-2">
                      {t("defaultAddressBadge")}
                    </span>
                  </div>
                )}
                {!address.isSelectedForSubscription && (
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-teal-500 font-medium bg-white border px-2 py-1 rounded-md">
                      {t("selectAsShipping")}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-base 3xl:text-lg flex items-center wrap-break-word break-all">
                      {address.firstName} {address.lastName} <Dot />{" "}
                      <Home className="h-4 3xl:h-5 w-4 3xl:w-5 shrink-0 text-gray-500" />
                    </p>
                    <div className="flex items-start gap-2 mt-1.5 wrap-break-word break-all text-sm 3xl:text-base">
                      <span className="line-clamp-3">{formatAddressLine(address)}</span>
                    </div>
                    <p className="text-sm 3xl:text-base mt-1">
                      {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-sm 3xl:text-base mt-0.5">
                        {address.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, address)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                      aria-label={t("editAddressAria")}
                    >
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, address._id)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                      aria-label={t("deleteAddressAria")}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddressModal
        mode="add"
        trigger={<></>}
        isShow={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        showDefaultCheckbox={false}
      />

      <AddressModal
        mode="edit"
        address={
          editingAddress as (AddressFormData & { _id: string }) | undefined
        }
        trigger={<></>}
        isShow={isEditModalOpen}
        onClose={handleCloseEdit}
        showDefaultCheckbox={false}
      />
    </div>
  );
}
