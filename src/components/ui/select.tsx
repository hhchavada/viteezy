"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  placeholder?: string;
  children: React.ReactNode;
  error?: string; // Error message to display
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  className,
  children,
  placeholder,
  error,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isActive = isFocused || value !== "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsOpen(false);
    onChange?.(e);
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id || name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          {...rest}
          name={name}
          id={id || name}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setIsOpen(false);
          }}
          onMouseDown={() => setIsOpen((open) => !open)}
          onKeyDown={(e) => {
            if (
              e.key === " " ||
              e.key === "Enter" ||
              e.key === "ArrowDown" ||
              e.key === "ArrowUp"
            ) {
              setIsOpen(true);
            }
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className={cn(
            // Hide default arrow
            "[&::-webkit-appearance:none] appearance-none",
            // Base styles - matching InputField styling
            "w-full border hover:outline-1 rounded-[12px] px-4 pr-10 text-sm bg-white cursor-pointer",
            " focus:outline-1 text-gray-800",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 outline-red-500 focus:ring-2 focus:ring-red-500"
              : "border-extra-light-gray outline-teal-500",
            className,
            placeholder ? "pt-6.5 pb-2" : "py-3.5"
          )}
        >
          {placeholder && <option value="" hidden />}

          {children}
        </select>

        <label
          className={cn(
            "absolute left-4 pointer-events-none transition-all duration-200",
            isActive
              ? "top-2.5 text-[13px] leading-none text-teal-600"
              : "top-1/2 -translate-y-1/2 text-base text-medium-gray"
          )}
        >
          {placeholder}
        </label>

        {/* Custom Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <ChevronDown
            strokeWidth={3}
            className={cn(
              "h-5 w-5 text-gray-500 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
