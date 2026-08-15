"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "teal" | "teal-green" | "gray" | "white" | "black";
  className?: string;
  spinClassName?: string;
  text?: string;
}

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const colorClasses = {
  teal: "border-teal-500",
  "teal-green": "border-teal-green-color",
  gray: "border-gray-500",
  white: "border-white",
  black: "border-black",
};

const Spinner: React.FC<SpinnerProps> = ({
  size = "lg",
  color = "teal-green",
  className,
  spinClassName,
  text = "",
}) => {
  return (
    <div
      className={cn(
        "text-center",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 mx-auto",
          sizeClasses[size],
          colorClasses[color],
          spinClassName
        )}
      />
      {text && <span className="block mt-5 text-gray-400">{text}</span>}
    </div>
  );
};

export default Spinner;
