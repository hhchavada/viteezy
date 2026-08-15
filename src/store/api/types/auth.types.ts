/**
 * Authentication API Types
 * Centralized type definitions for all auth-related API calls
 */

// ==================== LOGIN ====================
export interface EmailLoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface MainMemberLoginRequest {
  mainMemberId: string;
  firstName: string;
  password: string;
  deviceInfo?: string;
}

export type LoginRequest = EmailLoginRequest | MainMemberLoginRequest;

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

// ==================== SOCIAL LOGIN ====================
export interface SocialLoginRequest {
  idToken: string;
  deviceInfo: string;
}

export interface SocialLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

// ==================== REGISTER ====================
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  password: string;
  email?: string;
  mainMemberId?: string;
  relationshipToParent?: string;
  registrationSource?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

// ==================== USER ====================
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: "user" | "admin";
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== COMMON ERROR ====================
export interface ApiError {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
  statusCode?: number;
}

// ==================== FORGOT PASSWORD ====================
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// ==================== RESET PASSWORD ====================
export interface ResetPasswordRequest {
  email?: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ==================== CHANGE PASSWORD ====================
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ==================== VERIFY OTP ====================
export interface VerifyOtpRequest {
  otp: string;
  email: string;
  type: "Email Verification" | "Password Reset";
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

// ==================== RESEND OTP ====================
export interface ResendOtpRequest {
  email: string;
  type: "Email Verification" | "Password Reset";
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

// ==================== MAGIC LINK ====================
export interface VerifyMagicLinkResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    recommendationId: string;
    sessionId: string;
  };
}
