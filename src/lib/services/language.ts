/**
 * Language Utility Helper
 * 
 * Provides functions to get language from localStorage and determine if user is logged in
 */

/**
 * Get language code from localStorage
 * Returns 'en' as default if not found
 */
export const getLanguageCode = (): string => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("lang") || "en";
};

/**
 * Check if user is logged in (has access token)
 */
export const isUserLoggedIn = (): boolean => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("accessToken");
    return !!token;
};

/**
 * Get language parameter for API requests
 * - If user is logged in: returns undefined (language will be fetched from user/me)
 * - If user is not logged in: returns language code for query parameter
 */
export const getLanguageParam = (): string | undefined => {
    return isUserLoggedIn() ? undefined : getLanguageCode();
};

/**
 * Locale for API `lang` query — always mirrors localStorage (`en` default), including logged-in users.
 * Use when the endpoint should follow the current UI language regardless of auth.
 */
export const getLanguageQueryForApi = (): string => getLanguageCode();
