"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

interface InputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  icon,
  className,
  disabled,
  value,
  onChange,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Get form context - will be undefined if not wrapped in FormProvider
  const formContext = useFormContext();
  const { register, formState: { errors } = {}, watch } = formContext || {};

  // Watch the field value to determine if it's active
  const fieldValue = watch?.(name);
  const isActive = isFocused || (fieldValue && fieldValue.length > 0);

  // Get error for this field
  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative w-full">
        <input
          type={type}
          {...(register ? register(name) : { name })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          {...(onChange ? { onChange } : {})}
          {...(value !== undefined ? { value } : {})}
          {...(maxLength !== undefined ? { maxLength } : {})}
          // NOTE: padding is CONSTANT; text never jumps
          className={cn(
            className, // user classes first (so base wins if conflicting)
            "w-full border rounded-xl px-4 pt-5 pb-2 text-sm bg-white outline-none transition-all",
            "border-extra-light-gray text-gray-800  hover:border-teal-500",
            icon && "pr-10",
            error && "border-red-500",
            type === "password" && "hide-password-reveal"
          )}
          // we use our own visual placeholder
          placeholder=""
        />

        <label
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-200",
            isActive
              ? "top-1.5 text-[11px] leading-none text-medium-gray" // floated top, small
              : "top-1/2 -translate-y-1/2 text-sm text-medium-gray" // perfectly centered
          )}
        >
          {placeholder}
        </label>

        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
            {icon}
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
