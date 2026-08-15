"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  preIcon?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** NEW PROP */
  floating?: boolean; // true = floating label, false = normal placeholder
  error?: string; // Error message to display
  name?: string; // Name attribute for form fields
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      type = "text",
      value,
      onChange,
      placeholder = "",
      preIcon,
      icon,
      className,
      floating = true, // default = your current beautiful style
      error,
      name,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value?.length > 0;
    const isActive = isFocused || hasValue;

    // When floating is disabled → we use native placeholder + simpler padding
    if (!floating) {
      return (
        <div className="w-full flex flex-col gap-1">
          {label && (
            <label className="text-sm 3xl:text-base font-medium">{label}</label>
          )}
          <div className="relative w-full">
            <input
              ref={ref}
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-[12px] border bg-white px-4 py-4 text-sm 3xl:text-base text-gray-800 focus:outline-none focus:ring-2",
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-extra-light-gray focus:ring-teal-500",
                disabled &&
                  "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] opacity-80 hover:outline-none focus:ring-0",
                className,
                preIcon && "pl-12",
              )}
              disabled={disabled}
              {...props}
            />

            {preIcon && (
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                {preIcon}
              </span>
            )}
            {icon && (
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">
                {icon}
              </span>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
    }

    // ──────── ORIGINAL FLOATING LABEL STYLE (unchanged) ────────
    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full rounded-[12px] border hover:outline-1 bg-white px-4 pt-6.5 pb-2 text-sm text-gray-800 focus:outline-none focus:ring-2",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-extra-light-gray focus:ring-teal-500 outline-teal-500",
              disabled &&
                "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] opacity-80 hover:outline-none focus:ring-0",
              preIcon && "pl-12", // extra left padding when icon exists
              className,
            )}
            disabled={disabled}
            {...props}
          />

          {/* Floating Label */}
          <label
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ",
              preIcon && "left-12",
              disabled
                ? isActive
                  ? "top-2.5 -translate-y-0 text-[13px] text-[#9CA3AF]"
                  : "text-base text-[#D1D5DB]"
                : isActive
                  ? "top-2.5 -translate-y-0 text-[13px] text-teal-600"
                  : "text-base text-medium-gray",
            )}
          >
            {placeholder || label}
          </label>

          {preIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {preIcon}
            </span>
          )}
          {icon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </span>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
