"use client";

import React, { useEffect, useState } from "react";
import PortalDialog, { DialogHeader } from "@/components/ui/portalDialog";
import InputField from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { User } from "@/store/api/types/user.types";
import { useUpdateUserProfileMutation } from "@/store/api/userApi";
import { useTranslations } from "next-intl";

interface EditProfileModalProps {
    trigger?: React.ReactNode;
    isShow?: boolean;
    onClose?: () => void;
    user?: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    trigger,
    isShow,
    onClose,
    user,
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = isShow !== undefined ? isShow : internalIsOpen;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const email = user?.email ?? "";

    const [updateUserProfile, { isLoading, error }] = useUpdateUserProfileMutation();
    const t = useTranslations("Account");
    const tCommon = useTranslations("Common");

    // Prefill names from firstName/lastName if available; otherwise parse name
    useEffect(() => {
        if (isOpen) {
            if (user?.firstName || user?.lastName) {
                setFirstName((user?.firstName || "").trim().slice(0, 50));
                setLastName((user?.lastName || "").trim());
            } else {
                const parts = (user?.name || "").trim().split(" ");
                setFirstName((parts[0] || "").slice(0, 50));
                setLastName(parts.slice(1).join(" ") || "");
            }
        }
    }, [isOpen, user?.name, user?.firstName, user?.lastName]);

    const handleInternalOpen = () => setInternalIsOpen(true);

    const handleClose = () => {
        if (isShow === undefined) setInternalIsOpen(false);
        if (onClose) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUserProfile({
                firstName: firstName.trim().slice(0, 50),
                lastName: lastName.trim(),
            }).unwrap();
            handleClose();
        } catch (err) {
            // Error handled by RTK Query; no-op
            console.error(err);
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
                width={700}
                contentClass="p-2.5"
                isShow={isOpen}
                onClose={handleClose}
                showCloseButton={false}
                bodyClass="max-h-[80vh] "
            >
                <DialogHeader>
                    <div className="flex justify-between items-center mb-9">
                        <h2 className="text-3xl font-medium m-0">{t("editAccount")}</h2>
                        <button onClick={handleClose} aria-label={tCommon("close")}>
                            <X className="h-10 w-10 p-1.5 rounded-full border cursor-pointer" />
                        </button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">{t("updateAccountFailed")}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1  gap-5">
                        <InputField
                            name="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) =>
                                setFirstName(e.target.value.slice(0, 50))
                            }
                            placeholder={t("firstName")}
                            className="bg-gray-50 border-transparent"
                            maxLength={50}
                        />
                        <InputField
                            name="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={t("lastName")}
                            className="bg-gray-50 border-transparent"
                        />
                        <InputField
                            name="email"
                            type="email"
                            value={email}
                            onChange={() => { }}
                            placeholder={t("email")}
                            className="bg-gray-50 border-transparent cursor-not-allowed"
                            disabled
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            size="elevate"
                            variant="tealElevate"
                            className="font-medium"
                            animateText
                            disabled={isLoading}
                        >
                            {isLoading ? t("saving") : t("updateAccount")}
                        </Button>
                    </div>
                </form>
            </PortalDialog>
        </>
    );
};

export default EditProfileModal;
