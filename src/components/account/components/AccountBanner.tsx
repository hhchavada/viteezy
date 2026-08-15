"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@/store/api/types/user.types";
import { useUpdateUserProfileMutation } from "@/store/api/userApi";
import { useTranslations } from "next-intl";

interface AccountBannerProps {
  userName?: string;
  user?: User;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export default function AccountBanner({
  userName,
  user,
  onLogout,
  isLoggingOut = false,
}: AccountBannerProps) {
  const [memberIdCopied, setMemberIdCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const translate = useTranslations("Common");
  const t = useTranslations("Account");

  // Resolve full name using first/last if available
  const displayUserName = userName ?? t("guestUserName");
  const fullName =
    ((user?.firstName || "") + " " + (user?.lastName || "")).trim() ||
    displayUserName;
  // Get user initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCopy = async (text: string, type: "memberId" | "referral") => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === "memberId") {
        setMemberIdCopied(true);
        setTimeout(() => setMemberIdCopied(false), 2000);
      } else {
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
      }
    } catch (err) {
      console.error("Clipboard failed, fallback used", err);
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      if (type === "memberId") {
        setMemberIdCopied(true);
        setTimeout(() => setMemberIdCopied(false), 2000);
      } else {
        setReferralCopied(true);
        setTimeout(() => setReferralCopied(false), 2000);
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setLocalAvatar(base64); // instant preview
      try {
        await updateUserProfile({ avatar: base64 }).unwrap();
      } catch (err) {
        console.error("Avatar upload failed", err);
        setLocalAvatar(null); // revert preview on failure
      } finally {
        setIsUploading(false);
        // reset input so same file can be picked again
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="section-padding overflow-hidden relative">
      <div className="relative bg-cover bg-right bg-no-repeat radius-style min-h-72 3xl:min-h-75 bg-linear-to-r from-[#D4E8E4] to-[#F5E6D3] w-full flex items-center">
        <div className="w-section mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side - User Info */}
            <div className="sm:flex items-start gap-4">
              {/* Avatar wrapper – overflow-visible so the + button peeks out */}
              <div className="relative shrink-0 w-16 h-16 md:w-20 md:h-20 mb-4 sm:mb-0 mx-auto sm:mx-0">
                {/* Circle image / initials */}
                <div className="w-full h-full bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                  {localAvatar || user?.avatar || user?.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        localAvatar ||
                        user?.avatar ||
                        (user?.profileImage as string)
                      }
                      alt={t("avatarAlt")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xl font-medium">
                      {getInitials(fullName)}
                    </span>
                  )}

                  {/* Upload spinner overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <svg
                        className="animate-spin w-6 h-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Plus button — sits outside overflow-hidden, properly positioned */}
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading}
                  title={isUploading ? t("uploading") : t("changeAvatar")}
                  className="absolute bottom-0 right-0 z-10 flex items-center justify-center w-6 h-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-md transition disabled:opacity-60 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User Details */}
              <div className="flex-1 flex flex-col gap-3">
                <h1 className="text-2xl md:text-3xl font-medium text-black-color mb-2 text-center sm:text-start">
                  {t("helloGreeting", {
                    name: fullName.split(" ")[0] || t("guestUserName"),
                  })}
                </h1>

                {/* Member ID and Referral Code */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {/* Member ID */}
                  {user?.memberId && (
                    <div className="flex items-center gap-2 rounded-md bg-white/40 p-2.5 sm:p-1.5 px-3.5 sm:px-2 w-full sm:w-auto">
                      <span className="flex items-start sm:items-center gap-1 sm:gap-2 flex-col sm:flex-row w-full sm:w-auto">
                        <span className="text-gray-800">
                          {t("memberIdLabel")}
                        </span>
                        <span className="font-medium  text-black-color">
                          {user.memberId}
                        </span>
                      </span>
                      <button
                        onClick={() => handleCopy(user.memberId, "memberId")}
                        className="hover:bg-white/90 cursor-pointer rounded transition-colors bg-white p-2 "
                        title={memberIdCopied ? t("copied") : t("copyMemberId")}
                      >
                        {memberIdCopied ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {user?.referralCode && (
                    <>
                      <div className="w-0.5 bg-white/50 sm:h-7" />
                      <div className="flex items-center gap-2 rounded-md bg-white/40 p-2.5 sm:p-1.5 px-3.5 sm:px-2 w-full sm:w-auto">
                        <span className="flex items-start sm:items-center gap-1 sm:gap-2 flex-col sm:flex-row w-full sm:w-auto">
                          <span className="text-gray-800">
                            {t("referralCodeLabel")}
                          </span>
                          <span className="font-medium text-black-color">
                            {user.referralCode}
                          </span>
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(user.referralCode!, "referral")
                          }
                          className="over:bg-white/90 cursor-pointer rounded transition-colors bg-white p-2"
                          title={
                            referralCopied ? t("copied") : t("copyReferralCode")
                          }
                        >
                          {referralCopied ? (
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Welcome Message */}
                <p className="text-gray-600 text-sm mt-2">
                  {t("welcomeToAccount")}
                  <br />
                  {t("manageOrdersInfo")}
                </p>
              </div>
            </div>

            {/* Right side - Logout Button */}
            <Button
              className="shrink-0 4xl:text-base! h-9! 4xl:h-11! px-6"
              variant="elevate"
              size="elevate-md"
              animateText
              onClick={() => {
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? translate("logoutLoading") : translate("logOut")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
