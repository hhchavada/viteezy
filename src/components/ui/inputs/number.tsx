"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface NumberFieldProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
    min?: number;
    max?: number;
}

const NumberField: React.FC<NumberFieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    icon,
    className,
    min,
    max,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || value.length > 0;

    return (
        <div className="w-full flex flex-col gap-1">
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}

            <div className="relative w-full">
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    min={min}
                    max={max}
                    className={cn(
                        className,
                        // Constant padding to prevent jumping
                        "w-full border rounded-xl px-4 pt-5 pb-2 text-sm bg-white outline-none transition-all",
                        "border-extra-light-gray text-gray-800  hover:border-teal-500",
                        icon && "pr-10"
                    )}
                    placeholder=""
                />

                <label
                    className={cn(
                        "absolute left-4 pointer-events-none transition-all duration-200",
                        isActive
                            ? "top-1.5 text-[11px] leading-none text-medium-gray"
                            : "top-1/2 -translate-y-1/2 text-sm text-medium-gray"
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
        </div>
    );
};

export default NumberField;
