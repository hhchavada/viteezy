"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import AccountNav from "../components/AccountNav";
import AddressModal from "./AddressModal";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from "@/store/api/addressApi";
import { Address } from "@/store/api/types/addresses.types";
import { AddressFormData } from "@/hooks/useAddressValidation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

const Addresses = () => {
  const t = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const { data, isLoading } = useGetAddressesQuery();
  const addresses: Address[] = data?.data?.addresses || [];
  const [deleteAddress] = useDeleteAddressMutation();

  // Modal state - single modal instance outside the loop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAddress(null);
  };

  // Sort addresses: default address first, then others
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const handleDelete = async (addressId: string) => {
    if (typeof window !== "undefined" && window.confirm(t("deleteAddressConfirm"))) {
      try {
        await deleteAddress(addressId).unwrap();
        toast.success(t("addressDeletedSuccess"));
      } catch {
        toast.error(t("addressDeleteFailed"));
      }
    }
  };

  return (
    <div className="mb-7">
      <AccountNav title={t("tabs.addresses")} />

      <div className="flex items-center justify-end mt-4">
        <Button
          variant="tealElevate"
          size="elevate"
          animateText
          onClick={handleOpenAddModal}
        >
          {t("addNewAddress")}
        </Button>
      </div>

      <hr className="border-t mt-4 mb-5" />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAddresses.map((address) => (
            <div
              key={address._id}
              className="bg-slate-50-color p-6 rounded-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                {address.isDefault && (
                  <div className="text-2xl font-medium mb-5">{t("defaultAddressBadge")}</div>
                )}
                <div className="space-y-1 wrap-break-word">
                  <div className="text-lg">
                    {address.firstName} {address.lastName}
                  </div>
                  <div className="text-base line-clamp-2">
                    {address.address}
                  </div>
                  <div className="text-base">
                    {address.city}, {address.postalCode}
                  </div>
                  <div className="text-base">
                    {address.country}
                  </div>
                  {address.phone && (
                    <div className="text-base">
                      {address.phone}
                    </div>
                  )}
                  {address.note && (
                    <div className="text-sm text-gray-600 italic mt-2">
                      {t("notePrefix")}: {address.note}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-x-2 flex">
                <Button
                  variant="outlineElevate"
                  animateText
                  className="h-10! px-6 border-gray-700 hover:rounded-lg"
                  onClick={() => handleOpenEditModal(address)}
                >
                  {tCommon("edit")}
                </Button>
                <Button
                  onClick={() => handleDelete(address._id)}
                  variant="outlineElevate"
                  animateText
                  className="h-10! px-6 border-red-500 text-red-500 hover:rounded-lg"
                >
                  {tCommon("delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50-color p-10 rounded-xl">
          <p className="text-gray-600 italic">{t("noAddressesYet")}</p>
        </div>
      )}

      {/* Single Add Modal Instance - Outside the loop */}
      <AddressModal
        mode="add"
        trigger={<></>}
        isShow={isAddModalOpen}
        onClose={handleCloseAddModal}
      />

      {/* Single Edit Modal Instance - Outside the loop */}
      <AddressModal
        mode="edit"
        address={
          editingAddress as (AddressFormData & { _id: string }) | undefined
        }
        trigger={<></>}
        isShow={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </div>
  );
};

export default Addresses;
