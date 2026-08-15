"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/dataTable";
import { useTranslations } from "next-intl";
import { useGetFamilyMembersQuery, useRemoveFamilyMemberMutation } from "@/store/api/familyMemberApi";
import { SubMember } from "@/store/api/types/familyMember.types";
import Spinner from "@/components/ui/spinner";
import { toast } from "react-hot-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal";

const SubMemberTab = () => {
    const t = useTranslations("Account");
    const tAccount = useTranslations("Account");
    const tCommon = useTranslations("Common");
    const translate = useTranslations("Membership");
    
    const { data: familyMembersData, isLoading, error } = useGetFamilyMembersQuery();
    const [removeFamilyMember, { isLoading: isRemoving }] = useRemoveFamilyMemberMutation();
    
    // Local state to manage the member list without refetching
    const [localMembers, setLocalMembers] = useState<SubMember[]>([]);
    
    // Initialize local members when API data changes
    React.useEffect(() => {
        if (familyMembersData?.data?.subMembers) {
            setLocalMembers(familyMembersData.data.subMembers);
        }
    }, [familyMembersData]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const handleRemoveFamilyMember = async (memberId: string, memberName: string) => {
        // Open confirmation modal instead of browser confirm
        const displayName = memberName || "-";
        setMemberToRemove({ id: memberId, name: displayName });
        setIsModalOpen(true);
    };

    const confirmRemoveFamilyMember = async () => {
        if (!memberToRemove) return;
        
        try {
            await removeFamilyMember(memberToRemove.id).unwrap();
            
            // Manually remove the member from local state
            setLocalMembers(prevMembers => 
                prevMembers.filter(member => member._id !== memberToRemove.id)
            );
            
            toast.success(tAccount("familyMemberRemovedSuccessfully"));
            setIsModalOpen(false);
            setMemberToRemove(null);
        } catch (error: any) {
            toast.error(error?.data?.message || tAccount("failedToRemoveFamilyMember"));
            console.error("Remove family member error:", error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setMemberToRemove(null);
    };

    // Define columns for the table
    const columns: ColumnDef<SubMember>[] = [
        {
            accessorKey: "memberId",
            header: t("membershipId"),
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">
                    {row.getValue("memberId")}
                </span>
            ),
        },
        {
            accessorKey: "email",
            header: tAccount("email"),
            cell: ({ row }) => (
                <span className="text-gray-700">{row.getValue("email") || "-"}</span>
            ),
        },
        {
            id: "actions",
            header: tAccount("actions"),
            cell: ({ row }) => {
                const member = row.original;
                const [isMenuOpen, setIsMenuOpen] = useState(false);
                
                return (
                    <DropdownMenu
                        open={isMenuOpen}
                        onOpenChange={setIsMenuOpen}
                        trigger={
                            <button 
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                </svg>
                            </button>
                        }
                    >
                        <DropdownMenuItem
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveFamilyMember(member._id, member.name)}
                            disabled={isRemoving}
                        >
                            {tAccount("remove")}
                        </DropdownMenuItem>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spinner />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{tAccount("Failed to load family members")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold">{tAccount("memberList")}</h2>

            {/* Family Members Table */}
            <DataTable
                columns={columns}
                data={localMembers}
                title={tAccount("memberList")}
                noResultsMessage={tCommon("noMembersAvailable")}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmRemoveFamilyMember}
                title={tAccount("remove")}
                message={`${tAccount("confirmRemoveFamilyMember")} ${memberToRemove?.name}?`}
                confirmText={tAccount("remove")}
                cancelText={tCommon("cancel")}
            />
        </div>
    );
};

export default SubMemberTab;
