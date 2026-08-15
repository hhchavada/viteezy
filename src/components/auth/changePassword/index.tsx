"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/button";
import { useChangePasswordMutation } from "@/store";
import AuthErrorMessage from "@/components/ui/authErrorMessage";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getApiErrorFromUnknown } from "@/lib/apiError";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordScreen() {
  const tAuth = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const changePasswordSchema = yup.object().shape({
    currentPassword: yup.string().required(tAuth("changePasswordRequiredCurrent")),
    newPassword: yup
      .string()
      .required(tAuth("changePasswordRequiredNew"))
      .min(8, tAuth("changePasswordMinLength")),
    confirmPassword: yup
      .string()
      .required(tAuth("changePasswordConfirmRequired"))
      .oneOf([yup.ref("newPassword")], tAuth("changePasswordMismatch")),
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const router = useRouter();

  const methods = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setErrorMessage(null);
    try {
      const result = await changePassword(data).unwrap();
      if (result.success) {
        router.push("/account");
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tAuth("failedToChangePassword"),
        })
      );
      console.error("Change password error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4ED] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-transparent flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 flex-col">
          <h1 className="text-3xl font-semibold ">{tAuth("changePassword")}</h1>
          <p className="text-base text-gray-600">
            {tCommon("enterPasswordToUpdate")}
          </p>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4 mt-2"
          >
            {errorMessage && (
              <AuthErrorMessage message={errorMessage} className="mb-2" />
            )}

            <InputField
              name="currentPassword"
              placeholder={tAuth("currentPassword")}
              type={showCurrentPassword ? "text" : "password"}
              disabled={isLoading}
              icon={
                <div
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={23} className="text-gray-400" />
                  ) : (
                    <Eye size={23} className="text-gray-400" />
                  )}
                </div>
              }
            />

            <InputField
              name="newPassword"
              placeholder={tAuth("newPassword")}
              type={showNewPassword ? "text" : "password"}
              disabled={isLoading}
              icon={
                <div
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff size={23} className="text-gray-400" />
                  ) : (
                    <Eye size={23} className="text-gray-400" />
                  )}
                </div>
              }
            />

            <InputField
              name="confirmPassword"
              placeholder={tAuth("confirmNewPassword")}
              type={showConfirmPassword ? "text" : "password"}
              disabled={isLoading}
              icon={
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={23} className="text-gray-400" />
                  ) : (
                    <Eye size={23} className="text-gray-400" />
                  )}
                </div>
              }
            />

            <div className="tex-center flex items-center justify-center flex-col gap-2">
              <Button
                variant="login"
                size="login"
                className="mt-3"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? tAuth("changing") : tAuth("updatePassword")}
              </Button>
              <Link href="/account" className="text-lg cursor-pointer">
                {tCommon("cancel")}
              </Link>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
