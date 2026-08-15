// components/ui/phoneNumberInput.tsx
"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AsYouType,
  CountryCode,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from "libphonenumber-js";
import { DEFAULT_SUPPORTED_COUNTRIES } from "../constants/countries";

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  floating?: boolean;
  error?: string;
  name?: string;
  defaultCountry?: CountryCode;
  supportedCountries?: CountryCode[];
  touched?: boolean; // optional, if you were passing this before
}

const DEFAULT_SUPPORTED: CountryCode[] = DEFAULT_SUPPORTED_COUNTRIES;

const countryToFlag = (country: CountryCode) =>
  country
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "Phone number",
  className,
  floating = true,
  error,
  name,
  defaultCountry = "NL",
  supportedCountries = DEFAULT_SUPPORTED,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [formattedValue, setFormattedValue] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);

  // Format as user types & auto-detect country from calling code
  useEffect(() => {
    if (!value) {
      setFormattedValue("");
      return;
    }

    try {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country && parsed.country !== selectedCountry) {
        setSelectedCountry(parsed.country);
      }

      const formatter = new AsYouType(selectedCountry);
      const formatted = formatter.input(value);
      setFormattedValue(formatted);
    } catch {
      setFormattedValue(value);
    }
  }, [value, selectedCountry]);

  const ensureLeadingPlus = (v: string): string => {
    // Keep only digits and '+'
    let cleaned = v.replace(/[^\d+]/g, "");
    // Only one '+' and only at the beginning
    cleaned = cleaned.replace(/(?!^)\+/g, "");
    if (cleaned === "") return "";
    if (!cleaned.startsWith("+")) cleaned = `+${cleaned}`;
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    const prevDigits = (value || "").replace(/\D/g, "");
    let next = ensureLeadingPlus(rawInput);
    const nextDigits = next.replace(/\D/g, "");

    // Always allow delete / shortening
    if (nextDigits.length <= prevDigits.length) {
      onChange(next);
      return;
    }

    // If current value is already valid → block extra digits
    if (value) {
      const currentWithPlus = ensureLeadingPlus(value);
      try {
        if (isValidPhoneNumber(currentWithPlus)) {
          // Ignore extra input; keep current value
          return;
        }
      } catch {
        // fall through if lib throws
      }
    }

    onChange(next);
  };

  const handleInternalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (value) {
      try {
        const parsed = parsePhoneNumberFromString(value);
        if (parsed?.number) {
          // Normalize to E.164 (+31612345678)
          onChange(parsed.number);
        }
      } catch {
        // keep as is if parsing fails
      }
    }

    onBlur?.(e);
  };

  const handleFocus = () => setIsFocused(true);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as CountryCode;
    setSelectedCountry(newCountry);

    const newDial = getCountryCallingCode(newCountry);
    // Reset to just the dial code
    onChange(`+${newDial}`);
  };

  const hasValue = !!value && value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="w-full flex flex-col gap-1 ">
      <div className="relative w-full">
        {/* Country selector with flag + calling code */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="bg-transparent text-lg text-gray-700 outline-none cursor-pointer pr-1"
          >
            {supportedCountries.map((c) => (
              <option key={c} value={c}>
                {countryToFlag(c)}
              </option>
            ))}
          </select>
        </div>

        <input
          type="tel"
          name={name}
          value={formattedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleInternalBlur}
          placeholder={floating ? undefined : placeholder}
          className={cn(
            "w-full rounded-[12px] border bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 ps-4 pe-14 hover:border-teal-500",
            floating ? "pt-6.5 pb-2" : "py-4",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-extra-light-gray focus:ring-teal-500",
            className
          )}
        />

        {floating && (
          <label
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200",
              isActive
                ? "top-2.5 -translate-y-0 text-[13px] text-teal-600"
                : "text-base text-medium-gray"
            )}
          >
            {placeholder || label}
          </label>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhoneNumberInput;
