"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { ChangeHandler, useFormContext } from "react-hook-form";

interface CheckboxFieldProps {
  name: string;
  id?: string;
  label?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  id,
  label,
  checked,
  onChange,
  disabled,
  className,
  error,
}) => {
  const formContext = useFormContext();

  const register = formContext?.register;
  const errors = formContext?.formState?.errors;

  const fieldError = error || (errors?.[name]?.message as string | undefined);
  const checkboxId = id || name;

  const registerProps = register
    ? register(name)
    : ({} as Partial<{
        onChange: ChangeHandler;
        onBlur: ChangeHandler;
        ref: React.Ref<HTMLInputElement>;
        name: string;
      }>);

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          {...registerProps}
          onChange={(e) => {
            registerProps.onChange?.(e);
            onChange?.(e);
          }}
          {...(checked !== undefined ? { checked } : {})}
          className={cn(
            "appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm",
            "checked:bg-teal-500 checked:border-teal-500",
            "cursor-pointer transition-colors",
            "checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]",
            "checked:bg-center checked:bg-no-repeat checked:bg-[length:12px_12px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            fieldError && "border-red-500",
            className
          )}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium text-gray-700 cursor-pointer select-none",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {fieldError && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {fieldError}
        </p>
      )}
    </div>
  );
};

export default CheckboxField;
