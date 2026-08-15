"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import InputField from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "@/store";
import AuthErrorMessage from "@/components/ui/authErrorMessage";
import AuthLayout from "../auth-layout";
import { useTranslations } from "next-intl";
import { getApiErrorFromUnknown } from "@/lib/apiError";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const tAuth = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const resetPasswordSchema = yup.object().shape({
    password: yup
      .string()
      .required(tAuth("passwordRequired"))
      .min(8, tAuth("passwordMinLength")),
    confirmPassword: yup
      .string()
      .required(tAuth("changePasswordConfirmRequired"))
      .oneOf([yup.ref("password")], tAuth("changePasswordMismatch")),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const methods = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage(null);
    try {
      const result = await resetPassword({
        email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        token,
      }).unwrap();

      if (result.success) {
        router.push("/login");
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tCommon("failedResetPassword"),
        })
      );
      console.error("Reset password error:", err);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-[#F6F4ED] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-transparent flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 flex-col">
            <h1 className="text-3xl font-semibold ">{tAuth("resetPassword")}</h1>
            <p className="text-base text-gray-600">{tCommon("enterNewPassword")}</p>
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
                name="password"
                placeholder={tAuth("newPassword")}
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                icon={
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff size={23} className="text-gray-400" />
                    ) : (
                      <Eye size={23} className="text-gray-400" />
                    )}
                  </div>
                }
              />

              <InputField
                name="confirmPassword"
                placeholder={tAuth("confirmPassword")}
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

              <Button
                variant="login"
                size="login"
                className="mt-3"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? tCommon("resetting") : tAuth("resetPassword")}
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </AuthLayout>
  );
}
