"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { useChangePasswordMutation } from "@/store/api/authApi";
import { getApiErrorBody, getApiErrorFromUnknown } from "@/lib/apiError";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const ChangePasswordTab = () => {
    const t = useTranslations("Account");
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        // All fields are required
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = t("changePasswordRequiredCurrent");
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = t("changePasswordRequiredNew");
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = t("changePasswordMinLength");
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = t("changePasswordConfirmRequired");
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t("changePasswordMismatch");
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form before API call
        if (!validateForm()) {
            return;
        }

        try {
            // Call API with only currentPassword and newPassword
            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            }).unwrap();

            // Show success message
            toast.success(response.message || t("passwordChangedSuccess"));
            
            // Reset form after successful submission
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            
            // Clear any errors
            setErrors({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: unknown) {
            toast.error(
                getApiErrorFromUnknown(error, {
                    mode: "single",
                    fallback: t("failedToChangePassword"),
                })
            );

            const body = getApiErrorBody(error);
            if (body?.errors?.length) {
                const fieldErrors = { ...errors };
                for (const err of body.errors) {
                    if (
                        err.field &&
                        err.field in fieldErrors &&
                        typeof err.message === "string"
                    ) {
                        fieldErrors[err.field as keyof typeof fieldErrors] = err.message;
                    }
                }
                setErrors(fieldErrors);
            }
        }
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-semibold">{t("changePassword")}</h2>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("currentPassword")}
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder={t("enterCurrentPassword")}
                                className={`hide-password-reveal w-full px-4 py-3 bg-soft-slate border ${errors.currentPassword
                                    ? "border-red-500"
                                    : "border-extra-light-gray"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-green-color focus:border-transparent transition-all pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("newPassword")}
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder={t("enterNewPassword")}
                                className={`hide-password-reveal w-full px-4 py-3 bg-soft-slate border ${errors.newPassword
                                    ? "border-red-500"
                                    : "border-extra-light-gray"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-green-color focus:border-transparent transition-all pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-sm text-red-500">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("confirmNewPassword")}
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={t("confirmNewPasswordPlaceholder")}
                                className={`hide-password-reveal w-full px-4 py-3 bg-soft-slate border ${errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-extra-light-gray"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-green-color focus:border-transparent transition-all pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 md:pt-4">
                        <Button
                            type="submit"
                            size="elevate-md"
                            variant="elevate"
                            animateText
                            disabled={isLoading}
                            className=" text-white px-4 h-10! text-sm font-medium whitespace-nowrap 3xl:text-base mt-2 sm:mt-0"
                        >
                            {isLoading ? t("changing") : t("changePassword")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordTab;
