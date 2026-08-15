"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface SelectFieldProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
    className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    options,
    icon,
    className,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || value !== "";

    return (
        <div className="w-full flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}

            <div className="relative w-full">
                <select
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        className,
                        "w-full border rounded-xl px-4 pt-5 pb-2 text-sm bg-white outline-none transition-all cursor-pointer appearance-none",
                        "border-extra-light-gray text-gray-800  hover:border-teal-500",
                        icon && "pr-10"
                    )}
                >
                    {placeholder && (
                        <option value="" hidden />
                    )}

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Floating label */}
                <label
                    className={cn(
                        "absolute left-4 pointer-events-none transition-all duration-200",
                        isActive
                            ? "top-1 text-[11px] leading-none text-medium-gray"
                            : "top-1/2 -translate-y-1/2 text-sm text-medium-gray"
                    )}
                >
                    {placeholder}
                </label>

                {/* Right-side icon */}
                {icon ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        {icon}
                    </span>
                ) : (
                    <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5
                         text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default SelectField;
