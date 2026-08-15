"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const MEMBERSHIP_LOTTIE_SRC = encodeURI("/three stars members.lottie");

export default function ConfirmMembershipPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(27,175,154,0.14)_0%,transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(226,198,158,0.22)_0%,transparent_45%),linear-gradient(180deg,#f7f6f0_0%,#fbf9f8_100%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-40 w-40 items-center justify-center sm:mb-8 sm:h-48 sm:w-48">
          <DotLottieReact
            src={MEMBERSHIP_LOTTIE_SRC}
            loop
            autoplay
            className="h-full w-full"
          />
        </div>

        <p className="mb-3 font-saans text-md font-medium uppercase tracking-[0.22em] text-teal-green-color">
          Membership confirmed
        </p>

        <h1 className="font-cardinal text-4xl font-semibold tracking-tight text-charcol-color sm:text-5xl md:text-[3.5rem] md:leading-[1.1]">
          Thank you
        </h1>

        <p className="mt-4 max-w-md font-saans text-base leading-relaxed text-light-gray-color sm:mt-5 sm:text-lg">
          Welcome to Viteezy Membership. Your journey to better wellness starts
          now - we&apos;re glad you&apos;re here.
        </p>
      </div>
    </section>
  );
}
