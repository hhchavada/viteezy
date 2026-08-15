export type PlanTier = "essential" | "advanced";

export interface PlanSummary {
  supplementCount: number;
  pillsPerDay: number;
  monthlyPrice: number;
  currency: string;
  supplementNames: string[];
}

export interface Supplement {
  id: string;
  name: string;
  imageUrl: string;
  goalLabel: string;
  pillsCount: number;
  originalPrice: number;
  currentPrice: number;
  dosage: number;
  /** ISO currency code from complete API (e.g. USD, EUR, GBP) */
  currency?: string;
  disabled?: boolean;
  /** Mapped from API `isUserRemoved` */
  removed?: boolean;
  isUserRemoved?: boolean;
  description?: string;
}

export interface MembershipOption {
  id: string;
  name: string;
  label: string;
  badge: string | null;
  price: number;
  currency: string;
  active?: boolean;
  action?: "add" | "remove";
  benefits?: string[];
  shortDescription?: string;
  isBestValue?: boolean;
}

export interface ActiveMembershipInfo {
  membershipId: string;
  planId: string;
  name: string;
  label: string;
  interval: string;
  price: number;
  currency: string;
  savingsBadge: string | null;
  expiresAt: string;
  benefits: string[];
}

export interface MembershipSectionData {
  title: string;
  subtitle: string;
  hasActiveMembership: boolean;
  activeMembership: ActiveMembershipInfo | null;
  plans: MembershipOption[];
}

export interface OrderLineItem {
  label: string;
  value: string;
  variant?: "default" | "total" | "discount";
}

export interface AddOnProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  disabled?: boolean;
  isAdded?: boolean;
}
