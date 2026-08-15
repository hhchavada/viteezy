"use client";

import React, { useState } from "react";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { code: string; label: string; flag: string }[];
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  options,
}) => {
  const [open, setOpen] = useState(false);

  const selected = options.find((opt) => opt.code === value);

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm font-medium"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <span>{selected?.flag}</span>
          <span>{selected?.label}</span>
        </span>

        <span className="text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          {options.map((opt) => (
            <div
              key={opt.code}
              className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(opt.code);
                setOpen(false);
              }}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
