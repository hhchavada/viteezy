"use client";

import React from "react";
import { Check } from "lucide-react";

interface AuthSuccessMessageProps {
  message: string;
  className?: string;
}

export default function AuthSuccessMessage({
  message,
  className = "",
}: AuthSuccessMessageProps) {
  return (
    <div
      className={`bg-[#e9f7f5] border border-teal-500 rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
        <Check className="w-4 h-4 text-white" strokeWidth={3} />
      </div>
      <p className="text-base text-gray-900 leading-relaxed flex-1">{message}</p>
    </div>
  );
}

