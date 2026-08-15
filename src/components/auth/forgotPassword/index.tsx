"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/button";
import { useForgotPasswordMutation } from "@/store";
import AuthErrorMessage from "@/components/ui/authErrorMessage";
import AuthSuccessMessage from "@/components/ui/authSuccessMessage";
import Link from "next/link";
import AuthLayout from "../auth-layout";
import { useTranslations } from "next-intl";
import { getApiErrorFromUnknown } from "@/lib/apiError";

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const tAuth = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const forgotPasswordSchema = yup.object().shape({
    email: yup
      .string()
      .required(tAuth("emailRequired"))
      .email(tAuth("validEmail")),
  });
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await forgotPassword(data).unwrap();
      if (result.success) {
        setSuccessMessage(
          result.message ||
          tCommon("resetEmailSent")
        );
        // Navigate to OTP verification page with email and type
        // setTimeout(() => {
        //   router.push(
        //     `/verify-email?email=${encodeURIComponent(data.email)}&type=Password Reset`
        //   );
        // }, 1500);
        // Navigate to login screen instead
        setTimeout(() => {
          router.push("/login");
        }, 5000);
        // Clear form
        methods.reset();
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tCommon("failedSendResetEmail"),
        })
      );
      console.error("Forgot password error:", err);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-[#F6F4ED] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-transparent flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 flex-col">
            <h1 className="text-3xl font-semibold ">{tAuth("forgotPassword")}</h1>
            <p className="text-base text-gray-600">
              {tCommon("sendResetEmailHelp")}
            </p>
          </div>

          {successMessage ? (
            <div className="w-full flex flex-col gap-4 mt-2">
              <AuthSuccessMessage message={successMessage} />
              <Link
                href="/login"
                className="cursor-pointer text-center text-base text-gray-800 underline"
              >
                {tCommon("backToLogin")}
              </Link>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4 mt-2"
              >
                {errorMessage && (
                  <AuthErrorMessage message={errorMessage} className="mb-2" />
                )}

                <InputField
                  name="email"
                  placeholder={tAuth("email")}
                  type="email"
                  disabled={isLoading}
                />

                <Button
                  variant="login"
                  size="login"
                  className="mt-3"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? tCommon("sending") : tCommon("submit")}
                </Button>
                <Link href="/login" className="cursor-pointer text-center">
                  {tCommon("cancel")}
                </Link>
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
