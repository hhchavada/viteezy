import React from "react";
import { User } from "@/store/api/types/user.types";

// Account Filter Types
export type FilterType = "all" | "active" | "delivered";

// Account Tab Types
export interface Tab {
  id: string;
  href: string;
  /** Optional override; otherwise labels come from `Account.tabs.*` */
  label?: string;
}

// Account Component Props
export interface AccountProps {
  userName?: string;
  user?: User;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export interface AccountLayoutProps {
  children: React.ReactNode;
  userName?: string;
  user?: User;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export interface AccountTabsProps {
  tabs: Tab[];
}

// Order Filter Navigation Props
export interface OrderFilterNavProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    active: number;
    delivered: number;
  };
}

// Pricing structure matching API response
export interface OrderPricing {
  sachets?: {
    subTotal: number;
    discountedPrice: number;
    membershipDiscountAmount: number;
    subscriptionPlanDiscountAmount: number;
    taxAmount: number;
    total: number;
    currency: string;
    _id: string;
  };
  overall: {
    subTotal: number;
    discountedPrice: number;
    couponDiscountAmount: number;
    membershipDiscountAmount: number;
    subscriptionPlanDiscountAmount: number;
    taxAmount: number;
    grandTotal: number;
    currency: string;
    _id: string;
  };
  _id: string;
}

// Order Types
export interface OrderItem {
  id: string;
  name: string;
  quantity: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  total: number; // Keep for backward compatibility
  currency?: string; // Keep for backward compatibility
  status: "active" | "delivered" | "pending";
  paymentMethod?: string;
  paymentStatus?: string;
  /** From orders API — show Pay Now when true */
  canPayAgain?: boolean;
  deliveryDate: string;
  deliveryNote?: string;
  items: OrderItem[];
  pricing?: OrderPricing; // New nested pricing structure
}

// Favorite Product Types
export interface FavoriteProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  currency?: string;
  rating: number;
  reviewCount: number;
  image?: string;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  planName: string;
  duration: string;
  price: number;
  renewalDate: string;
  status: "active" | "paused" | "cancelled";
}

// Address Types
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

