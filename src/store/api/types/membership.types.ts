export interface MembershipPlan {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    price: {
        currency: string;
        amount: number;
        taxRate: number;
    };
    interval: string;
    durationDays: number;
    benefits: string[];
    isAutoRenew: boolean;
    isBestValue?: boolean;
}

// User membership types
export interface PlanId {
    _id: string;
    name: string;
    slug: string;
    price: {
        currency: string;
        amount: number;
        taxRate: number;
    };
    interval: string;
    durationDays: number;
    benefits: string[];
}

export interface PlanSnapshot {
    planId: string;
    name: string;
    slug: string;
    interval: string;
    durationDays: number;
    price: {
        currency: string;
        amount: number;
        taxRate: number;
    };
    benefits: string[];
}

export interface UserMembership {
    id: string;
    status: string;
    planLabel: string;
    planId: PlanId;
    planSnapshot: PlanSnapshot;
    amountDisplay: string;
    startDate: string;
    expiryDate: string;
    nextBillingDate: string;
    pauseDate: string | null;
    cancelDate?: string;
    daysUntilExpiry: number | null;
    daysUntilNextBilling: number | null;
    pauseReason: string | null;
    isAutoRenew: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface GetUserMembershipsRequest {
    page?: number;
    limit?: number;
}

export interface GetUserMembershipsResponse {
    success: boolean;
    message: string;
    data: UserMembership[];
    pagination: Pagination;
}

export interface GetMembershipPlansResponse {
    success: boolean;
    message: string;
    data: {
        plans: MembershipPlan[];
    };
}

export interface BuyMembershipRequest {
    planId: string;
    paymentMethod: string;
    beneficiaryUserId?: string;
}

export interface BuyMembershipResponse {
    success: boolean;
    message: string;
    data: {
        membership: {
            id: string;
            userId: string;
            planId: string;
            startDate: string;
            endDate: string;
            status: string;
            isAutoRenew: boolean;
        };
        payment?: {
            id: string;
            amount: number;
            currency: string;
            status: string;
            paymentUrl?: string;
            redirectUrl?: string;
            paymentMethod?: string;
            gatewayTransactionId?: string;
            membershipId?: string;
        };
    };
}
