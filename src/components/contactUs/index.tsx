"use client";

import Link from "next/link";
import Banner from "../ui/banner";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "../ui/input";
import SelectField from "../ui/select";
import { cn } from "@/lib/utils";
import PhoneNumberInput from "../ui/phoneNumberInput";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { useSubmitContactFormMutation } from "@/store/api/contactApi";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";

export default function ContactUsPage() {
  const t = useTranslations("ContactUs");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { data: settings, isLoading: settingsLoading } =
    useGeneralSettings(locale);
  const defaultCountryCode = "+31";

  // Validation schema
  const contactFormSchema = yup.object({
    subject: yup.string().required(t("subjectRequired")),
    name: yup.string().required(t("nameRequired")),
    email: yup.string().email(t("invalidEmail")).required(t("emailRequired")),
    phone: yup.string().required(t("phoneRequired")),
    message: yup.string().required(t("messageRequired")),
    agreePrivacy: yup
      .boolean()
      .required(t("privacyRequired"))
      .oneOf([true], t("privacyRequired")),
  });

  type ContactFormData = yup.InferType<typeof contactFormSchema>;

  // RTK Query mutation hook
  const [submitContactForm, { isLoading: isSubmitting }] =
    useSubmitContactFormMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactFormSchema),
    defaultValues: {
      subject: "",
      name: "",
      email: "",
      phone: defaultCountryCode,
      message: "",
      agreePrivacy: false,
    },
  });

  const heroImageSrc = "/products/productHeroBanner.png";
  const breadcrumbs = [
    { label: tCommon("home"), href: "/" },
    { label: t("title"), isActive: true },
  ];

  const subjectOptions = [
    { value: "general", label: t("generalInquiry") },
    { value: "support", label: t("customerSupport") },
    { value: "partnership", label: t("partnership") },
    { value: "feedback", label: t("feedback") },
    { value: "other", label: t("other") },
  ];

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Transform form data to match API payload
      const payload = {
        subject: data.subject,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        privacyAccepted: data.agreePrivacy,
      };

      // Submit form data
      const response = await submitContactForm(payload).unwrap();

      // Show success toast - handle different response structures
      const successMessage =
        response?.message || response?.data?.message || t("messageSent");

      toast.success(successMessage, {
        duration: 4000,
        style: { background: "#10b981", color: "#fff" },
      });

      // Reset form
      reset();
    } catch (error: unknown) {
      const errorMessage = getApiErrorFromUnknown(error, {
        mode: "single",
        fallback: t("messageError"),
      });

      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  return (
    <section className=" bg-off-white-color">
      <Banner
        backgroundImage={heroImageSrc}
        breadcrumbs={breadcrumbs}
        title={t("title")}
        description={t("description")}
      />

      <div className="container mx-auto px-4 pt-7 pb-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 3xl:gap-15 w-section mx-auto">
          {/* Left Side - Contact Information (from general settings) */}
          <div className="flex flex-col justify-between order-2 lg:order-1">
            <div>
              <h2 className="text-3xl font-medium text-gray-900 mb-8">
                {t("contactUs")}
              </h2>

              {settingsLoading ? (
                <div className="space-y-3 3xl:space-y-4.5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ) : (
                <div className="space-y-3 3xl:space-y-4.5">
                  <div>
                    {settings?.supportPhone && (
                      <div>
                        {/* <p className="text-base 3xl:text-lg font-medium">
                        {t("phone")}
                      </p> */}
                        <p className="text-base 3xl:text-lg -mt-1 font-medium">
                          <a
                            href={`tel:${settings.supportPhone.replace(
                              /\s/g,
                              ""
                            )}`}
                            className="hover:text-teal-600"
                          >
                            {settings.supportPhone}
                          </a>
                        </p>
                      </div>
                    )}
                    {settings?.supportEmail && (
                      <div>
                        <p className="text-base 3xl:text-lg font-medium">
                          {t("emailLabel")}:
                          <a
                            href={`mailto:${settings.supportEmail}`}
                            className="hover:text-teal-600"
                          >
                            {" "}{settings.supportEmail}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                  {settings?.address && (
                    <div>
                      <p className="text-base 3xl:text-lg font-medium">
                        {t("headOffice")}
                      </p>
                      <p className="text-base 3xl:text-lg -mt-1 font-medium">
                        {settings.address}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-base 3xl:text-lg font-medium">
                      {t("hours")}
                    </p>
                    <p className="text-base 3xl:text-lg -mt-1 font-medium">
                      {t("officeHours")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz CTA */}
            <div className="bg-sand-light/40 rounded-2xl 3xl:rounded-[30px] p-4 md:p-2 3xl:p-2.5 flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-12">
              <div className="relative w-full md:w-44 3xl:w-55 h-64 md:h-44 3xl:h-55 flex-shrink-0">
                <Image
                  src="/contactUs.png"
                  alt={t("productName") || "Viteezy Product"}
                  fill
                  className="object-cover rounded-xl 3xl:rounded-[22px]"
                />
              </div>
              <div className="text-left w-full md:w-auto">
                <h3 className="text-xl 3xl:text-2xl md:max-w-[85%] font-medium text-gray-900 mb-4 3xl:mb-7">
                  {t("readyToFeelBest")}
                </h3>
                <Link
                  href="/quiz"
                  // className="inline-block bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Button
                    animateText
                    variant="elevate"
                    size="elevate"
                    className="text text-base! 3xl:text-lg! max-h-12 3xl:max-h-14! leading-relaxed"
                  >
                    {t("takeQuiz")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="rounded-2xl order-1 lg:order-2">
            <h2 className="text-3xl  font-medium text-gray-900 mb-8">
              {t("askQuestion")}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 3xl:space-y-4.5"
            >
              {/* Subject */}
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <SelectField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("chooseSubject")}
                    error={errors.subject?.message}
                  >
                    <option value="">{t("chooseSubject")}</option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>
                )}
              />

              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputField
                    name={field.name}
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("namePlaceholder")}
                    error={errors.name?.message}
                  />
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    name={field.name}
                    type="email"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("emailPlaceholder")}
                    error={errors.email?.message}
                  />
                )}
              />

              {/* Phone */}
              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <PhoneNumberInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("phonePlaceholder")}
                    error={errors.phone?.message}
                    touched={fieldState.isTouched}
                  />
                )}
              />

              {/* Message */}
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <div className="w-full flex flex-col gap-1">
                    <textarea
                      {...field}
                      placeholder={t("messagePlaceholder")}
                      rows={5}
                      className={cn(
                        "w-full rounded-[12px] border bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 resize-none placeholder:text-base 3xl:text-lg h-36",
                        errors.message
                          ? "border-red-500 focus:ring-red-500"
                          : "border-extra-light-gray focus:ring-teal-500"
                      )}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Privacy Checkbox */}
              <div className="flex items-start gap-3 mt-2 mb-4">
                <Controller
                  name="agreePrivacy"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="privacy"
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={field.value}
                        onChange={field.onChange}
                        className="sr-only"
                      />

                      <div
                        className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          field.value
                            ? "bg-teal-green-color border-teal-green-color"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {field.value && (
                          <svg
                            className="w-5 h-5 text-white"
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
                        )}
                      </div>

                      <span className="text-sm text-gray-700">
                        {t("agreePrivacy")}
                      </span>
                    </label>
                  )}
                />
              </div>
              {errors.agreePrivacy && (
                <p className="text-red-500 text-sm -mt-2">
                  {errors.agreePrivacy.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-green-color hover:bg-teal-green-color/85 text-white py-3 rounded-full transition-colors text-base 3xl:text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("sending") || "Sending..." : t("sendMessage")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
