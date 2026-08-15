"use client";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { useRegisterMutation } from "@/store";
import { useGetStaticPagesQuery } from "@/store/api/staticPagesApi";
import { useRouter } from "next/navigation";
import AuthErrorMessage from "@/components/ui/authErrorMessage";
import Link from "next/link";
import AuthLayout from "../auth-layout";
import { RegisterRequest } from "@/store/api/types/auth.types";
import { useTranslations, useLocale } from "next-intl";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import SelectField from "@/components/ui/select";
import { Controller } from "react-hook-form";

type RegisterFormData = {
  firstName: string;
  lastName: string;
  email?: string;
  mainMemberId?: string;
  relationshipToParent?: string;
  password: string;
  confirmPassword: string;
};

export default function CreateAccountScreen() {
  const tAuth = useTranslations("Auth");
  const tAccount = useTranslations("Account");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { data: staticPagesData, isLoading: isLoadingPages } = useGetStaticPagesQuery({ lang: locale });
  const registerSchema: yup.ObjectSchema<RegisterFormData> = yup.object().shape({
    firstName: yup
      .string()
      .required(tCommon("firstNameRequired"))
      .max(50, tAccount("firstNameMax")),
    lastName: yup.string().required(tCommon("lastNameRequired")),
    email: yup
      .string()
      .test(
        "email-or-mainMemberId",
        tCommon("emailRequiredOrMemberId"),
        function (value) {
          const { mainMemberId } = this.parent;
          if (mainMemberId && mainMemberId.trim().length > 0) {
            if (value && value.trim().length > 0) {
              return yup.string().email().isValidSync(value);
            }
            return true;
          }
          return !!value && yup.string().email().isValidSync(value);
        }
      )
      .optional(),
    mainMemberId: yup.string().optional(),
    relationshipToParent: yup
      .string()
      .test(
        "relationship-required-with-mainMemberId",
        tAuth("relationshipRequired"),
        function (value) {
          const { mainMemberId } = this.parent;
          if (mainMemberId && mainMemberId.trim().length > 0) {
            return !!value && value.trim().length > 0;
          }
          return true;
        }
      )
      .optional(),
    password: yup
      .string()
      .required(tAuth("passwordRequired"))
      .min(6, tAuth("passwordMinLength"))
      .max(20, tCommon("passwordMaxLength20")),
    confirmPassword: yup
      .string()
      .required(tAuth("changePasswordConfirmRequired"))
      .oneOf([yup.ref("password")], tAuth("changePasswordMismatch")),
  }) as yup.ObjectSchema<RegisterFormData>;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMainMemberId, setShowMainMemberId] = useState(false);

  const relationshipOptions = [
    { value: "Child", label: tAuth("relationshipChild") },
    { value: "Spouse", label: tAuth("relationshipSpouse") },
    { value: "Parent", label: tAuth("relationshipParent") },
  ];

  // RTK Query hook for register mutation
  const [registerUser, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  // Find terms page from static pages
  const pages = staticPagesData?.data?.pages ?? [];
  const termsPage = pages.find((p) => {
    const titleLower = p.title.toLowerCase();
    return titleLower.includes("terms") || titleLower.includes("condition") || titleLower.includes("service");
  });

  // Find privacy policy page from static pages
  const privacyPage = pages.find((p) => {
    const titleLower = p.title.toLowerCase();
    return titleLower.includes("privacy");
  });

  // Determine if we should show the agreement section
  const showAgreement = termsPage || privacyPage;

  // React Hook Form setup with Yup validation
  const methods = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  // Watch password field to trigger confirm password validation
  const passwordValue = methods.watch("password");

  // Re-validate confirm password when password changes
  useEffect(() => {
    if (passwordValue && methods.getValues("confirmPassword")) {
      methods.trigger("confirmPassword");
    }
  }, [passwordValue, methods]);

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      const isSubMember =
        data.mainMemberId && data.mainMemberId.trim().length > 0;

      if (!isSubMember && !data.email) {
        setErrorMessage(tCommon("emailRequiredForRegistration"));
        return;
      }

      const payload: RegisterRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        ...(data.email && { email: data.email }),
        ...(isSubMember && {
          mainMemberId: data.mainMemberId!.trim(),
          relationshipToParent: data.relationshipToParent,
          registrationSource: "registration",
        }),
      };

      const result = await registerUser(payload).unwrap();

      if (result.success) {
        if (!result?.data?.user?.isEmailVerified) {
          router.push(
            "/verify-email?email=" + (data.email || result.data.user.email)
          );
        } else {
          router.push("/account");
        }
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tCommon("registrationFailed"),
        })
      );
      console.error("Registration error:", err);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-[#F6F4ED] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-transparent flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 flex-col">
            <h1 className="text-3xl font-semibold ">{tAuth("createAccountTitle")}</h1>
            <p className="text-base text-gray-600">
              {tAuth("alreadyHaveAccount")}
              <Link
                href="/login"
                className="ml-1 underline font-medium text-black-color"
              >
                {tAuth("login")}
              </Link>
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
                name="firstName"
                placeholder={tAuth("firstName")}
                disabled={isLoading}
                maxLength={50}
              />

              <InputField
                name="lastName"
                placeholder={tAuth("lastName")}
                disabled={isLoading}
              />

              <InputField
                name="email"
                placeholder={tAuth("email")}
                type="email"
                disabled={isLoading}
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowMainMemberId(!showMainMemberId)}
                  className="text-sm text-gray-600 hover:text-black-color underline cursor-pointer"
                >
                  {tAuth("joiningFamilyEnterMemberId")}
                </button>
              </div>

              {showMainMemberId && (
                <>
                  <InputField
                    name="mainMemberId"
                    placeholder={tAuth("memberIdPlaceholder")}
                    disabled={isLoading}
                  />
                  <Controller
                    name="relationshipToParent"
                    control={methods.control}
                    render={({ field }) => (
                      <SelectField
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={tAuth("relationshipToParent")}
                        error={
                          methods.formState.errors.relationshipToParent?.message
                        }
                      >
                        <option value="">{tAuth("relationshipToParent")}</option>
                        {relationshipOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectField>
                    )}
                  />
                </>
              )}

              <InputField
                name="password"
                placeholder={tAuth("password")}
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
                {isLoading ? tAuth("creatingAccount") : tAuth("createAccountButton")}
              </Button>

              {isLoadingPages ? (
              <div className="flex items-center gap-3 flex-col">
                <p className="text-base text-center text-gray-600">
                  {tAuth("agreementIntro")}
                  <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse ml-1"></span>
                  <span className="mx-1">{tCommon("and")}</span>
                  <span className="inline-block w-20 h-4 bg-gray-200 rounded animate-pulse ml-1"></span>
                </p>
              </div>
            ) : showAgreement ? (
              <div className="flex items-center gap-3 flex-col">
                <p className="text-base text-center text-gray-600">
                  {tAuth("agreementIntro")}
                  {termsPage && (
                    <>
                      <Link
                        href={`/static-pages/${encodeURIComponent(termsPage.slug)}`}
                        className="ml-1 underline font-medium text-black-color"
                        // target="_blank"
                        rel="noopener noreferrer"
                      >
                        {termsPage.title}
                      </Link>
                      {privacyPage && <span>{" "}{tCommon("and")}</span>}
                    </>
                  )}
                  {privacyPage && (
                    <Link
                      href={`/static-pages/${encodeURIComponent(privacyPage.slug)}`}
                      className="ml-1 underline font-medium text-black-color"
                      // target="_blank"
                      rel="noopener noreferrer"
                    >
                      {privacyPage.title}
                    </Link>
                  )}
                </p>
              </div>
            ) : null}
            </form>
          </FormProvider>
        </div>
      </div>
    </AuthLayout>
  );
}
