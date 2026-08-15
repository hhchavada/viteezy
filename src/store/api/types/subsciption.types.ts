export interface OrderReference {
  _id: string;
  orderNumber: string;
  status: string;
  grandTotal?: number;
}

export interface SubscriptionItem {
  productId: string;
  name: string;
  planDays: number;
  capsuleCount: number;
  amount: number;
  discountedPrice: number;
  taxRate: number;
  totalAmount: number;
  durationDays: number;
  savingsPercentage: number;
  features: string[];
  _id: string;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  orderId: OrderReference;
  status: string;
  planType: string;
  cycleDays: number;
  currency?: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string | null;
  items: SubscriptionItem[];
  initialDeliveryDate: string;
  nextDeliveryDate: string | null;
  nextBillingDate: string | null;
  lastBilledDate: string;
  lastDeliveredDate: string | null;
  daysUntilNextDelivery: number;
  daysUntilNextBilling: number;
  cancelledAt: string | null;
  cancellationReason?: string | null;
  pausedAt: string | null;
  pausedUntil?: string | null;
  subscriptionRelation?: "self" | "family" | string;
  ownerUserId?: string;
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

export interface GetSubscriptionsResponse {
  success: boolean;
  message: string;
  data: Subscription[];
  pagination: Pagination;
}

export interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
}

export interface GetSubscriptionByIdResponse {
  success: boolean;
  message: string;
  data: { subscription: Subscription };
}

export interface SubscriptionProduct {
  productId: string;
  name: string;
  planDays: number;
  capsuleCount: number;
  amount: number;
  discountedPrice: number;
  taxRate: number;
  totalAmount: number;
  currency?: string;
  durationDays: number;
  savingsPercentage: number;
  features: string[];
  product: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    productImage: string;
    benefits: string[];
    ingredients: {
      _id: string;
      name: string;
      description: string;
      image: string | null;
    }[];
    categories: {
      _id: string;
      name: string;
      description: string;
      sortOrder: number;
      icon: string | null;
      image: string | null;
      productCount: number;
    }[];
    healthGoals: string[];
    nutritionInfo: string;
    galleryImages: string[];
    howToUse: string;
    status: boolean;
    price: {
      currency: string;
      amount: number;
      taxRate: number;
    };
    variant: string;
    hasStandupPouch: boolean;
    sachetPrices: {
      [key: string]: {
        currency: string;
        amount: number;
        discountedPrice: number;
        taxRate: number;
        totalAmount: number;
        durationDays: number;
        capsuleCount: number;
        savingsPercentage: number;
        features: string[];
      };
    };
    standupPouchPrice: {
      [key: string]: {
        currency: string;
        amount: number;
        discountedPrice: number;
        taxRate: number;
        capsuleCount: number;
        features: string[];
        savingsPercentage: number;
        totalAmount: number;
      };
    };
    standupPouchImages: string[];
    comparisonSection: {
      title: string;
      columns: string[];
      rows: {
        label: string;
        values: boolean[];
      }[];
    };
    specification: {
      main_title: string;
      bg_image: string | null;
      items: {
        title: string;
        descr: string;
        image: string | null;
        imageMobile: string | null;
      }[];
    };
    isFeatured: boolean;
    isDeleted: boolean;
    deletedAt: string | null;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    variants: unknown[];
    faqs: unknown[];
  };
}

export interface SubscriptionProductCycle {
  label: string;
  effectiveUntil?: string;
  effectiveFrom?: string;
  status: string;
  subscriptionChangeId?: string;
  cartId?: string | null;
  items: SubscriptionProduct[];
}

export interface GetSubscriptionProductsResponse {
  success: boolean;
  message: string;
  data: {
    subscriptionId: string;
    canChangeProducts?: boolean;
    daysUntilRenewal?: number;
    changeWindowDays?: number;
    renewalDate?: string;
    currency?: string;
    currentCycle?: SubscriptionProductCycle;
    nextCycle?: SubscriptionProductCycle;
    items: SubscriptionProduct[];
  };
}

export interface ProductStatus {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  productImage: string;
  benefits: string[];
  ingredients: {
    _id: string;
    name: string;
    description: string;
    image: string | null;
  }[];
  categories: {
    _id: string;
    name: string;
    description: string;
    sortOrder: number;
    icon: string | null;
    image: string | null;
    productCount: number;
  }[];
  healthGoals: string[];
  nutritionInfo: string;
  galleryImages: string[];
  howToUse: string;
  status: boolean;
  price: {
    currency: string;
    amount: number;
    taxRate: number;
  };
  variant: string;
  hasStandupPouch: boolean;
  sachetPrices: {
    [key: string]: {
      currency: string;
      amount: number;
      discountedPrice: number;
      taxRate: number;
      totalAmount: number;
      durationDays: number;
      capsuleCount: number;
      savingsPercentage: number;
      features: string[];
    };
  };
  standupPouchPrice: {
    [key: string]: {
      currency: string;
      amount: number;
      discountedPrice: number;
      taxRate: number;
      capsuleCount: number;
      features: string[];
      savingsPercentage: number;
      totalAmount: number;
    };
  };
  standupPouchImages: string[];
  comparisonSection: {
    title: string;
    columns: string[];
    rows: {
      label: string;
      values: boolean[];
    }[];
  };
  specification: {
    main_title: string;
    bg_image: string | null;
    items: {
      title: string;
      descr: string;
      image: string | null;
      imageMobile: string | null;
    }[];
  };
  isFeatured: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  variants: unknown[];
  faqs: unknown[];
  isInSubscription: boolean;
  isInCart: boolean;
  subscriptionPrice: number | null;
}

export interface GetSubscriptionProductsStatusResponse {
  success: boolean;
  message: string;
  data: ProductStatus[];
  pagination: Pagination;
}

export interface UpdateSubscriptionProductsResponse {
  success: boolean;
  message: string;
  data: {
    cartId: string;
    cartType: string;
    items: {
      productId: string;
      variantType: string;
      quantity: number;
      isOneTime: boolean;
      planDays: number;
      price: {
        currency: string;
        amount: number;
        taxRate: number;
      };
      totalAmount: number;
      isSubscriptionChange: boolean;
      addedAt: string;
      _id: string;
      id: string;
    }[];
    subtotal: number;
    tax: number;
    total: number;
  };
}
