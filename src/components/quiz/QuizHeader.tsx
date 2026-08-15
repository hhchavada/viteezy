"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface QuizHeaderProps {
  progress?: number;
  onLogoClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function QuizHeader({
  progress = 0,
  onLogoClick,
}: QuizHeaderProps) {
  const tQuiz = useTranslations("Quiz");
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <header className="sticky top-0 z-50 shrink-0 bg-white pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center justify-center px-4 py-4 md:py-5">
        <Link
          href="/"
          aria-label={tQuiz("headerHomeAria")}
          onClick={(event) => {
            if (!onLogoClick) return;
            event.preventDefault();
            onLogoClick(event);
          }}
        >
          <Image
            src="/logos/logo.webp"
            alt="Viteezy"
            width={130}
            height={36}
            className="h-7 w-auto md:h-8"
            priority
          />
        </Link>
      </div>
      <div className="h-1 w-full bg-off-white-color">
        <div
          className="h-full bg-teal-green-color transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </header>
  );
}
