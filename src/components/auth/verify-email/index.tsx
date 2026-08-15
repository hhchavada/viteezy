"use client";
import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/store";
import AuthErrorMessage from "@/components/ui/authErrorMessage";
import AuthLayout from "../auth-layout";
import { useTranslations } from "next-intl";
import { getApiErrorFromUnknown } from "@/lib/apiError";

const OTP_TIMER_SECONDS = 120;

export default function VerifyEmailPage() {
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const verificationType = (searchParams.get("type") ||
    "Email Verification") as "Email Verification" | "Password Reset";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(OTP_TIMER_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer storage key based on email and type for uniqueness
  const getTimerStorageKey = () => `otp_timer_${email}_${verificationType}`;
  const getTimerStartTimeKey = () => `otp_start_${email}_${verificationType}`;

  // Initialize timer from session storage or set new timer
  useEffect(() => {
    const storageKey = getTimerStorageKey();
    const startTimeKey = getTimerStartTimeKey();
    
    // Check if there's an existing timer in session storage
    const storedStartTime = sessionStorage.getItem(startTimeKey);
    
    if (storedStartTime) {
      const startTime = parseInt(storedStartTime);
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      const remainingTime = OTP_TIMER_SECONDS - elapsedSeconds;
      
      // If timer hasn't expired, use remaining time
      if (remainingTime > 0) {
        setTimer(remainingTime);
      } else {
        // Timer expired, clean up session storage
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(startTimeKey);
        setTimer(0);
      }
    } else {
      // Set new timer start time
      sessionStorage.setItem(startTimeKey, Date.now().toString());
    }
  }, [email, verificationType]);

  // Timer countdown with session storage sync
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev - 1;
          // Update session storage with remaining time
          sessionStorage.setItem(getTimerStorageKey(), newTime.toString());
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Clean up session storage when timer expires
      sessionStorage.removeItem(getTimerStorageKey());
      sessionStorage.removeItem(getTimerStartTimeKey());
    }
  }, [timer, email, verificationType]);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Clean up timer storage function
  const clearTimerStorage = () => {
    sessionStorage.removeItem(getTimerStorageKey());
    sessionStorage.removeItem(getTimerStartTimeKey());
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^[0-9]+$/.test(pastedData)) {
      const newOtp = pastedData
        .split("")
        .concat(Array(6 - pastedData.length).fill(""))
        .slice(0, 6);
      setOtp(newOtp);
      // Focus the next empty input or last input
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setErrorMessage(tAuth("otpCompleteCodeRequired"));
      return;
    }

    setErrorMessage(null);
    try {
      const result = await verifyOtp({
        otp: otpString,
        email,
        type: verificationType,
      }).unwrap();

      if (result.success) {
        // Clear timer storage on successful verification
        clearTimerStorage();
        if (verificationType === "Email Verification") {
          router.push("/");
        } else {
          router.push(`/resetPassword?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tAuth("verificationFailedTryAgain"),
        })
      );
      console.error("OTP verification error:", err);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    setErrorMessage(null);
    try {
      const result = await resendOtp({
        email,
        type: verificationType,
      }).unwrap();

      if (result.success) {
        // Clear existing timer storage and reset timer
        clearTimerStorage();
        setTimer(OTP_TIMER_SECONDS);
        // Set new start time for fresh timer
        sessionStorage.setItem(getTimerStartTimeKey(), Date.now().toString());
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorFromUnknown(err, {
          mode: "single",
          fallback: tAuth("failedToResendCodeTryAgain"),
        })
      );
      console.error("Resend OTP error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AuthLayout>
      <div className="min-h-[calc(100dvh-4rem)] bg-[#F6F4ED] flex items-center justify-center px-3 py-6 sm:p-4">
        <div className="w-full max-w-md bg-transparent flex flex-col items-center gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex w-full items-center gap-3 flex-col text-center">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {tAuth("otpVerificationTitle")}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              {tAuth("otpSentToEmailHelp")}
              <br />
              <span className="font-medium text-gray-800 break-all">
                {email || tAuth("yourEmailFallback")}
              </span>
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <AuthErrorMessage message={errorMessage} className="w-full" />
          )}

          {/* OTP Input Boxes */}
          <div className="grid w-full grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="aspect-square w-full min-w-0 max-h-14 rounded-lg border-2 border-gray-300 bg-white text-center text-xl font-semibold outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 sm:rounded-xl sm:text-2xl"
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-1.5 text-teal-700 sm:gap-2">
              <Clock className="size-[18px] shrink-0 sm:size-5" />
              <span className="truncate text-sm font-medium sm:text-base">
                {tAuth("codeExpiresInLabel")}
              </span>
            </div>
            <span className="shrink-0 text-base font-semibold text-teal-700 sm:text-lg">
              {formatTime(timer)}
            </span>
          </div>

          {/* Verify Button */}
          <Button
            variant="login"
            size="login"
            onClick={handleVerify}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full"
          >
            {isLoading ? tAuth("verifying") : tAuth("verifyCode")}
          </Button>

          {/* Resend OTP - Only show when timer expires */}
          {timer === 0 && (
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-base font-medium text-teal-600 hover:text-teal-700 underline disabled:opacity-50"
              >
                {isResending ? tAuth("sending") : tAuth("resendCode")}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
