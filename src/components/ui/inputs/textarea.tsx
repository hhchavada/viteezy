"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface TextareaFieldProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  /** When set, enforces max length and shows "current / max" counter */
  maxLength?: number;
  error?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  maxLength,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || value.length > 0;

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className="text-sm 3xl:text-base font-medium">{label}</label>
      )}

      <div className="relative w-full">
        <textarea
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            className,
            "w-full border rounded-xl px-4 pt-3 pb-2 text-sm 3xl:text-base bg-white resize-none transition-all focus:outline-none focus:ring-2",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-extra-light-gray text-dim-gray placeholder:text-dim-gray focus:ring-teal-500",
            maxLength && "pb-10"
          )}
          placeholder={placeholder}
        />
        {maxLength != null && (
          <div className="flex justify-end mt-1 text-sm 3xl:text-base text-dim-gray absolute bottom-0 end-0 mb-5 me-4 bg-white">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default TextareaField;
