"use client";

import { getLanguageFlagUrl } from "@/lib/utils";

interface LanguageFlagIconProps {
  langCode: string;
  className?: string;
  size?: number;
}

/**
 * Displays a 24x24 rounded-full flag image for the given language code.
 * Use wherever the current language is shown as an icon (e.g. header trigger).
 * Do not use inside the language selection modal content.
 */
export default function LanguageFlagIcon({
  langCode,
  className = "",
  size = 24,
}: LanguageFlagIconProps) {
  const src = getLanguageFlagUrl(langCode);
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
