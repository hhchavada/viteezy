import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  BaseQueryApi,
} from "@reduxjs/toolkit/query";
import { toast } from "react-hot-toast";

// ============================================================
// STEP 1: Helper Functions for Token Management
// ============================================================

/**
 * Get auth token from localStorage
 * Returns null if running on server or no token exists
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

/**
 * Get refresh token from localStorage
 * Returns null if running on server or no token exists
 */
const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

/**
 * Save auth token to localStorage
 */
const saveAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const clearAuthStorage = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

/**
 * Remove auth token and redirect to login (no toast)
 */
export const handleLogout = (): void => {
  clearAuthStorage();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

let isSessionExpiryInProgress = false;

/**
 * 401 after refresh failure or invalid session: toast once, clear auth, redirect.
 */
const handleSessionExpired = (): void => {
  if (typeof window === "undefined") return;
  if (isSessionExpiryInProgress) return;
  isSessionExpiryInProgress = true;

  toast.error("Session expired");

  window.setTimeout(() => {
    clearAuthStorage();
    window.location.href = "/login";
  }, 100);
};

// ============================================================
// STEP 2: Basic API Configuration
// ============================================================

/**
 * Simple base query that makes API calls
 * Automatically adds auth token to every request (except public auth endpoints)
 */
const PUBLIC_ENDPOINTS = [
  "login",
  "register",
  "googleLogin",
  "appleLogin",
  "forgotPassword",
  "resetPassword",
  // Public blog endpoints
  "getBlogs",
  "getBlogCategories",
  "getBlogById",
  "getPopularBlogs",
  // Public FAQ endpoint
  "getFaqs",
  "getFaqsByLang",
  // Public static pages (privacy, terms, etc.)
  "getStaticPage",
  "getStaticPages",
  // Public general settings
  "getGeneralSettings",
  // Public header banner (top offer)
  "getHeaderBanner",
  // Public contact form
  "submitContactForm",
  // Public membership plans listing
  "getMembershipPlans",
];

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,

  prepareHeaders: (headers, { endpoint }) => {
    const token = getAuthToken();

    // Add auth token only if available and not a public endpoint
    if (token && !PUBLIC_ENDPOINTS.includes(endpoint)) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // Set default content type
    headers.set("content-type", "application/json");
    return headers;
  },
});

// ============================================================
// STEP 3: Enhanced Query with Auto Token Refresh
// ============================================================

/**
 * Wrapper around baseQuery that handles token expiration
 *
 * How it works:
 * 1. Makes the API call
 * 2. If 401 on a protected request (with access token), try refresh token
 * 3. If refresh succeeds, retry the original request (same base URL as the caller)
 * 4. If refresh fails or retry still returns 401, clear session, toast "Session expired", redirect to login
 */
export const baseQueryWithAuth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: {},
  customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = baseQuery
) => {
  let result = await customBaseQuery(args, api, extraOptions);

  const endpointName = api.endpoint;
  const isPublicEndpoint = PUBLIC_ENDPOINTS.includes(endpointName);
  const requestUrl = typeof args === "string" ? args : args.url;
  const isAuthUrl =
    typeof requestUrl === "string" && requestUrl.includes("/auth/");

  if (
    result.error?.status === 401 &&
    !isPublicEndpoint &&
    !isAuthUrl &&
    getAuthToken()
  ) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      handleSessionExpired();
      return result as import("@reduxjs/toolkit/query").QueryReturnValue<
        unknown,
        FetchBaseQueryError,
        {}
      >;
    }

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as { accessToken: string };
      saveAuthToken(accessToken);
      result = await customBaseQuery(args, api, extraOptions);

      if (result.error?.status === 401) {
        handleSessionExpired();
      }
    } else {
      handleSessionExpired();
    }
  }

  return result as import("@reduxjs/toolkit/query").QueryReturnValue<
    unknown,
    FetchBaseQueryError,
    {}
  >;
};

// ============================================================
// STEP 4: Main API Configuration (Base API)
// ============================================================

/**
 * Central API configuration for the entire app
 *
 * All API endpoints (auth, products, cart, etc.) connect here
 * This avoids code duplication (DRY principle)
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,

  /**
   * Cache Tags - Used to automatically refresh data
   * When you invalidate a tag, all queries with that tag refetch
   */
  tagTypes: [
    "Auth",
    "User",
    "Product",
    "Cart",
    "QuizCart",
    "CheckoutSummary",
    "Order",
    "Blog",
    "FAQ",
    "Wishlist",
    "Addresses",
    "Subscription",
    "Membership",
    "Members",
    "Contact",
    "FamilyMember",
  ],

  /**
   * Empty endpoints - will be filled by authApi, productApi, etc.
   * They use .injectEndpoints() to add their endpoints here
   */
  endpoints: () => ({}),
});

export default baseApi;
