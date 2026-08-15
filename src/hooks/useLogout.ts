"use client";

import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/store";
import { useAppDispatch } from "@/store";
import { baseApi } from "@/store/api/baseApi";
import { useTranslations } from "next-intl";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const t = useTranslations("Common");

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error(t("logoutError"), error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }

      dispatch(baseApi.util.resetApiState());
      router.push("/login");
    }
  };

  return {
    logout,
    isLoggingOut: isLoading,
  };
}
