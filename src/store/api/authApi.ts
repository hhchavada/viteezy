import { baseApi } from "./baseApi";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ResendOtpResponse,
  ResendOtpRequest,
  VerifyOtpResponse,
  VerifyOtpRequest,
  VerifyMagicLinkResponse,
  SocialLoginRequest,
  SocialLoginResponse,
} from "./types/auth.types";
import type { GetUserMeResponse } from "./types/user.types";
import { clearQuizGuestToken } from "@/lib/quizGuestToken";
import { persistMagicLinkRecommendationContext } from "@/components/quiz/questions/quizSessionStorage";

/**
 * Helper: Store auth data in localStorage after successful login/register
 */
const storeAuthData = (
  data: LoginResponse["data"] | RegisterResponse["data"]
) => {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

const storeMagicLinkAuthData = (data: VerifyMagicLinkResponse["data"]) => {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  clearQuizGuestToken();
  persistMagicLinkRecommendationContext(data);
};

/**
 * Helper: Clear auth data from localStorage
 */
const clearAuthData = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ============================================================
// Authentication API Endpoints
// ============================================================

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * LOGIN
     * Email + password, or mainMemberId + firstName + password
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          ...credentials,
          deviceInfo: "Web", // Track that login came from web
        },
      }),

      // After successful login, save token and user data
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            storeAuthData(data.data);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },

      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * REGISTER
     * Create new user account (with optional sub-member fields)
     */
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),

      // After successful registration, save token and user data
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            storeAuthData(data.data);
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },

      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * LOGOUT
     * End user session and clear stored data
     */
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      // Clear all stored auth data
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearAuthData();
        }
      },

      invalidatesTags: ["Auth", "User", "Cart", "Order"],
    }),

    /**
     * GOOGLE LOGIN
     * Authenticate with Google OAuth
     */
    googleLogin: builder.mutation<SocialLoginResponse, SocialLoginRequest>({
      query: (credentials) => ({
        url: "/auth/google/login",
        method: "POST",
        body: credentials,
      }),

      // After successful login, save token and user data
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            storeAuthData(data.data);
          }
        } catch (error) {
          console.error("Google login failed:", error);
        }
      },

      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * APPLE LOGIN
     * Authenticate with Apple OAuth
     */
    appleLogin: builder.mutation<SocialLoginResponse, SocialLoginRequest>({
      query: (credentials) => ({
        url: "/auth/apple-login",
        method: "POST",
        body: credentials,
      }),

      // After successful login, save token and user data
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            storeAuthData(data.data);
          }
        } catch (error) {
          console.error("Apple login failed:", error);
        }
      },

      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * FORGOT PASSWORD
     * Send reset password email to user
     */
    forgotPassword: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { ...data, deviceInfo: "Web" },
      }),
    }),

    /**
     * RESET PASSWORD
     * Set new password using reset token from email
     */
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * CHANGE PASSWORD
     * Change password for logged-in user
     */
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    /**
     * GET CURRENT USER
     * Fetch logged-in user details
     */
    getCurrentUser: builder.query<LoginResponse["data"]["user"], void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    /**
     * REFRESH TOKEN
     * Get new auth token when current one expires
     */
    refreshToken: builder.mutation<
      { accessToken: string },
      { refreshToken: string }
    >({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * VERIFY OTP
     * Verify email or password reset OTP
     */
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
      // After successful OTP verification, save token if provided
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            storeAuthData(data.data as any);
          }
        } catch (error) {
          console.error("OTP verification failed:", error);
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * RESEND OTP
     * Resend verification code to user's email
     */
    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    /**
     * VERIFY MAGIC LINK
     * Quiz recommendation email sign-in
     */
    verifyMagicLink: builder.mutation<VerifyMagicLinkResponse, string>({
      query: (token) => ({
        url: `/auth/magic-link/verify?token=${encodeURIComponent(token)}`,
        method: "GET",
      }),
      transformResponse: (response: VerifyMagicLinkResponse) => {
        if (response.success && response.data) {
          storeMagicLinkAuthData(response.data);
        }
        return response;
      },
      async onQueryStarted(_token, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            try {
              const profile = await dispatch(
                authApi.endpoints.getUserProfile.initiate(undefined, {
                  forceRefetch: true,
                })
              ).unwrap();
              if (profile?.data?.user) {
                localStorage.setItem("user", JSON.stringify(profile.data.user));
              }
            } catch {
              // Profile fetch is optional; tokens are enough for quiz APIs.
            }
          }
        } catch (error) {
          console.error("Magic link verification failed:", error);
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * GET USER PROFILE
     * Fetch current user profile with full details (requires authentication)
     */
    getUserProfile: builder.query<GetUserMeResponse, void>({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
  }),
});

// ============================================================
// Auto-Generated Hooks (Ready to use in components)
// ============================================================

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
  useAppleLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useRefreshTokenMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useVerifyMagicLinkMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
} = authApi;

export const {
  endpoints: { login, register, logout, getCurrentUser },
} = authApi;
