"use client";

import React, { useState } from "react";
import { useGetFamilyMembersQuery } from "@/store/api/familyMemberApi";
import { SubMember } from "@/store/api/types/familyMember.types";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/spinner";
import SelectField from "@/components/ui/select";

interface CheckoutForProps {
  onMemberSelect?: (memberId: string) => void;
  selectedMemberId?: string;
}

const CheckoutFor: React.FC<CheckoutForProps> = ({
  onMemberSelect,
  selectedMemberId,
}) => {
  const t = useTranslations("Checkout");
  const { data: familyMembersData, isLoading } = useGetFamilyMembersQuery();
  const [selectedMember, setSelectedMember] = useState<string>(
    selectedMemberId || ""
  );

  const familyMembers = familyMembersData?.data?.subMembers || [];

  const handleMemberChange = (memberId: string) => {
    setSelectedMember(memberId);
    if (onMemberSelect) {
      onMemberSelect(memberId);
    }
  };

  if (isLoading) {
    return (
      <div className="">
        {/* Skeleton for title */}
        {/* <div className="h-6 bg-gray-200 rounded-md mb-4 w-24"></div> */}

        {/* Skeleton for select field */}
        <div className="h-16 bg-gray-200 rounded-xl w-full"></div>
      </div>
    );
  }

  if (familyMembers.length > 0) {
    return (
      <div className="">
        <h3 className="text-lg font-semibold mb-4">{t("memberId")}</h3>

        <SelectField
          value={selectedMember}
          onChange={(e) => handleMemberChange(e.target.value)}
          placeholder={t("selectMemberId")}
          className=""
        >
          <option value="">{t("none")}</option>
          {familyMembers.map((member: SubMember) => (
            <option key={member._id} value={member._id}>
              {member?.email || member.memberId}
            </option>
          ))}
        </SelectField>
      </div>
    );
  }

  // Return empty state when no members available
  return null;
};

export default CheckoutFor;
