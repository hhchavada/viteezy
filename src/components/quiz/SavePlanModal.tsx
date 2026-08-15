"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PortalDialog from "@/components/ui/portalDialog";
import InputField from "@/components/ui/input";
import {
  cn,
  getLoggedInUserEmail,
  getUserFromStorage,
  hasAuthToken,
} from "@/lib/utils";
import { useGetQuizSessionContactInfoQuery } from "@/store/api/healthQuizApi";
import { useGetUserMeQuery } from "@/store/api/userApi";
import type { User } from "@/store/api/types/user.types";
import { resolveQuizSessionId } from "./questions/quizSessionStorage";
import { QUIZ_SAVE_PROGRESS_KEY } from "./questions/constants";
import type { QuizMessageTranslator } from "./questions/quizI18n";

export interface QuizSaveProgressForm {
  name: string;
  email: string;
  marketingConsent?: boolean;
  whatsappConsent?: boolean;
}

interface SavePlanModalProps {
  isOpen: boolean;
  sessionId?: string | null;
  isSaving?: boolean;
  isDiscarding?: boolean;
  apiError?: string | null;
  onClose: () => void;
  onContinueWithoutSaving: () => void;
  onSave: (data: QuizSaveProgressForm) => void;
}

type SavePlanFormValues = {
  name: string;
  email: string;
  marketingConsent: boolean;
  whatsappConsent: boolean;
};

function createSavePlanSchema(
  t: QuizMessageTranslator
): yup.ObjectSchema<SavePlanFormValues> {
  return yup.object({
    name: yup
      .string()
      .required(t("validationNameRequired"))
      .test("no-only-spaces", t("validationNameInvalid"), (value) =>
        Boolean(value?.trim())
      )
      .min(2, t("validationNameMinLength"))
      .max(50, t("validationNameMaxLength"))
      .matches(/^[a-zA-ZÀ-ÿ' -]+$/, t("validationNameInvalid")),
    email: yup
      .string()
      .required(t("validationEmailRequired"))
      .test("no-only-spaces", t("validationEmailInvalid"), (value) =>
        Boolean(value?.trim())
      )
      .email(t("validationEmailInvalid")),
    marketingConsent: yup.boolean().optional().default(false),
    whatsappConsent: yup.boolean().optional().default(false),
  }) as yup.ObjectSchema<SavePlanFormValues>;
}

function getLoggedInUserContactFromStorage(): { name: string; email: string } {
  const user = getUserFromStorage();
  if (!user) return { name: "", email: "" };

  const firstName =
    typeof user.firstName === "string" ? user.firstName.trim() : "";
  const lastName =
    typeof user.lastName === "string" ? user.lastName.trim() : "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    (typeof user.name === "string" ? user.name.trim() : "");

  const email =
    getLoggedInUserEmail() ||
    (typeof user.email === "string" ? user.email.trim() : "");

  return { name, email };
}

function getLoggedInUserContactFromProfile(
  user?: User | null
): { name: string; email: string } {
  if (!user) return { name: "", email: "" };

  const firstName = user.firstName?.trim() || "";
  const lastName = user.lastName?.trim() || "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user.name?.trim() ||
    "";

  return {
    name,
    email: user.email?.trim() || "",
  };
}

type ContactFieldLocks = {
  name: boolean;
  email: boolean;
};

function resolveContactFormState(
  saved: Partial<QuizSaveProgressForm>,
  options?: {
    contactInfo?: { name?: string; email?: string } | null;
    loggedInUser?: { name: string; email: string } | null;
  }
): { values: SavePlanFormValues; disabledFields: ContactFieldLocks } {
  const consentDefaults = getConsentDefaults(saved);
  const storedUser = getLoggedInUserContactFromStorage();

  const fallbackName = saved.name?.trim() || storedUser.name;
  const fallbackEmail = saved.email?.trim() || storedUser.email;

  const apiName = options?.contactInfo?.name?.trim();
  const apiEmail = options?.contactInfo?.email?.trim();
  const hasApiContact = Boolean(apiName || apiEmail);

  const profileName = options?.loggedInUser?.name?.trim();
  const profileEmail = options?.loggedInUser?.email?.trim();

  if (hasApiContact) {
    return {
      values: {
        name: apiName || fallbackName,
        email: apiEmail || fallbackEmail,
        ...consentDefaults,
      },
      disabledFields: {
        name: Boolean(apiName),
        email: Boolean(apiEmail),
      },
    };
  }

  return {
    values: {
      name: profileName || fallbackName,
      email: profileEmail || fallbackEmail,
      ...consentDefaults,
    },
    disabledFields: {
      name: Boolean(profileName),
      email: Boolean(profileEmail),
    },
  };
}

function loadSavedForm(): Partial<QuizSaveProgressForm> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(QUIZ_SAVE_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Partial<QuizSaveProgressForm>) : {};
  } catch {
    return {};
  }
}

function SaveCheckbox({
  id,
  checked,
  onChange,
  label,
  className,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-transparent transition-colors",
        disabled ? "cursor-default" : "cursor-pointer",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded border-2 border-[#D1D5DB] checked:border-[#23B299] checked:bg-[#23B299] checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] checked:bg-center checked:bg-no-repeat checked:bg-[length:12px_12px] disabled:cursor-default"
      />
      <span className="font-saans text-sm leading-snug text-black-color">
        {label}
      </span>
    </label>
  );
}

function getConsentDefaults(saved: Partial<QuizSaveProgressForm>) {
  return {
    marketingConsent:
      saved.marketingConsent ??
      (saved as { sendNewsletters?: boolean }).sendNewsletters ??
      false,
    whatsappConsent:
      saved.whatsappConsent ??
      (saved as { sendSmsUpdates?: boolean }).sendSmsUpdates ??
      false,
  };
}

export default function SavePlanModal({
  isOpen,
  sessionId,
  isSaving = false,
  isDiscarding = false,
  apiError = null,
  onClose,
  onContinueWithoutSaving,
  onSave,
}: SavePlanModalProps) {
  const tQuiz = useTranslations("Quiz");
  const tCommon = useTranslations("Common");
  const savePlanSchema = useMemo(
    () => createSavePlanSchema(tQuiz),
    [tQuiz]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavePlanFormValues>({
    resolver: yupResolver(savePlanSchema),
    defaultValues: {
      name: "",
      email: "",
      marketingConsent: false,
      whatsappConsent: false,
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [disabledFields, setDisabledFields] = useState<ContactFieldLocks>({
    name: false,
    email: false,
  });

  const resolvedSessionId = useMemo(
    () => (isOpen ? resolveQuizSessionId(sessionId) : null),
    [isOpen, sessionId]
  );

  const { data: contactInfoResponse } = useGetQuizSessionContactInfoQuery(
    resolvedSessionId ?? "",
    {
      skip: !isOpen || !resolvedSessionId,
      refetchOnMountOrArgChange: true,
    }
  );

  const isLoggedIn = isOpen && hasAuthToken();
  const { data: userMeData } = useGetUserMeQuery(undefined, {
    skip: !isLoggedIn,
    refetchOnMountOrArgChange: true,
  });

  const showFirstOrderDiscount =
    contactInfoResponse?.data?.isFirstTimeCustomer === true;

  useEffect(() => {
    if (!isOpen) {
      setDisabledFields({ name: false, email: false });
      return;
    }

    const saved = loadSavedForm();
    const loggedInProfile = getLoggedInUserContactFromProfile(
      userMeData?.data?.user
    );

    const { values, disabledFields: nextDisabledFields } = resolveContactFormState(
      saved,
      {
        contactInfo: contactInfoResponse?.data,
        loggedInUser: loggedInProfile,
      }
    );

    reset(values);
    setDisabledFields(nextDisabledFields);
    setSubmitError(null);
  }, [isOpen, contactInfoResponse, userMeData, reset]);

  const onSubmit = (data: SavePlanFormValues) => {
    setSubmitError(null);

    onSave({
      name: data.name.trim(),
      email: data.email.trim(),
      marketingConsent: data.marketingConsent,
      whatsappConsent: data.whatsappConsent,
    });
  };

  const isBusy = isSaving || isDiscarding;

  return (
    <PortalDialog
      isShow={isOpen}
      onClose={onClose}
      width={560}
      showCloseButton={false}
      bodyClass="p-0 max-h-[92vh] overflow-y-auto"
      className="overflow-hidden rounded-2xl"
      zIndexBackdrop={80}
      zIndexDialog={90}
      animationType="center"
    >
      <div className="rounded-t-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 bg-[#F7F6F0] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/quiz/save.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0"
              aria-hidden
            />
            <p className="font-saans text-sm font-medium text-black-color">
              {tQuiz("savePlanHeaderTitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label={tCommon("close")}
            className="cursor-pointer rounded-full p-1 text-black-color transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <form
        className="bg-white px-5 py-6 sm:px-6 sm:py-7"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h2 className="font-saans text-2xl font-medium text-black-color sm:text-[28px]">
          {tQuiz("savePlanTitle")}
        </h2>
        <p className="mt-2 font-saans text-sm leading-relaxed text-light-gray-color sm:text-[15px]">
          {tQuiz("savePlanDescription")}
        </p>

        <div className="mt-6 space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                name="name"
                type="text"
                placeholder={tQuiz("savePlanNamePlaceholder")}
                disabled={disabledFields.name}
                error={errors.name?.message}
                className="font-saans"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                name="email"
                type="email"
                placeholder={tQuiz("savePlanEmailPlaceholder")}
                disabled={disabledFields.email}
                error={errors.email?.message}
                className="font-saans"
              />
            )}
          />
        </div>

        <div className="mt-5 space-y-2">
          <SaveCheckbox
            id="quiz-save-recommendation"
            checked
            disabled
            label={
              <>
                <span className="font-medium">{tQuiz("savePlanRequiredLabel")}</span>{" "}
                {tQuiz("savePlanRecommendationConsent")}
              </>
            }
          />
          <Controller
            name="marketingConsent"
            control={control}
            render={({ field }) => (
              <SaveCheckbox
                id="quiz-save-marketing"
                checked={field.value}
                onChange={field.onChange}
                label={tQuiz("savePlanMarketingConsent")}
              />
            )}
          />
          <Controller
            name="whatsappConsent"
            control={control}
            render={({ field }) => (
              <SaveCheckbox
                id="quiz-save-whatsapp"
                checked={field.value}
                onChange={field.onChange}
                label={tQuiz("savePlanWhatsappConsent")}
              />
            )}
          />
        </div>

        {showFirstOrderDiscount ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#EDDFA5] px-4 py-2">
            <Image
              src="/quiz/gift.svg"
              alt=""
              width={18}
              height={17}
              className="shrink-0"
              aria-hidden
            />
            <span className="font-saans text-sm text-black-color">
              {tQuiz("savePlanFirstOrderDiscount")}
            </span>
          </div>
        ) : null}

        {(submitError || apiError) && (
          <p className="mt-4 font-saans text-sm text-red-600">
            {submitError || apiError}
          </p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="mt-6 w-full cursor-pointer rounded-full bg-[#23B299] py-3.5 font-saans text-base font-medium text-white transition-colors hover:bg-[#1fa389] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? tQuiz("savePlanSaving") : tCommon("continue")}
        </button>

        <button
          type="button"
          onClick={onContinueWithoutSaving}
          disabled={isBusy}
          className="mt-4 w-full cursor-pointer font-saans text-sm text-black-color underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDiscarding ? tQuiz("savePlanDiscarding") : tQuiz("savePlanContinueWithoutSaving")}
        </button>
      </form>
    </PortalDialog>
  );
}

export function persistQuizSaveProgress(data: QuizSaveProgressForm) {
  localStorage.setItem(QUIZ_SAVE_PROGRESS_KEY, JSON.stringify(data));
}
