// Cart API Types

export interface Price {
  currency: string;
  amount: number;
  taxRate: number;
  totalAmount?: number;
  totalTaxRate?: number;
}

export interface PriceWithTotal extends Price {
  totalAmount?: number;
  discountedPrice?: number;
  capsuleCount?: number;
  savingsPercentage?: number;
  features?: string[];
  durationDays?: number;
}

export interface SachetPrices {
  thirtyDays: PriceWithTotal;
  sixtyDays: PriceWithTotal;
  ninetyDays: PriceWithTotal;
  oneEightyDays: PriceWithTotal;
  oneTime: {
    count30: PriceWithTotal;
    count60: PriceWithTotal;
  };
}

export interface StandupPouchPrice {
  count_0: PriceWithTotal;
  count_1: PriceWithTotal;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description: string;
  image: {
    type: string;
    url: string;
    sortOrder: number;
  };
}

export interface Ingredient {
  _id: string;
  name: string;
  description: string;
}

export interface ComparisonRow {
  label: string;
  values: boolean[];
}

export interface ComparisonSection {
  title: string;
  columns: string[];
  rows: ComparisonRow[];
}

export interface SpecificationItem {
  title: string;
  descr: string;
  image: string;
  imageMobile: string;
}

export interface Specification {
  main_title: string;
  bg_image: string;
  items: SpecificationItem[];
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  productImage: string;
  shortDescription: string;
  description: string;
  nutritionInfo: string;
  howToUse: string;
  price: Price;
  variant: string;
  hasStandupPouch: boolean;
  sachetPrices: SachetPrices;
  standupPouchPrice: StandupPouchPrice;
  categories: Category[];
  ingredients: Ingredient[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any[];
  galleryImages: string[];
  isFeatured: boolean;
  comparisonSection: ComparisonSection;
  specification: Specification;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  ratingCount: number;
  is_liked: boolean;
  isMember: boolean;
  isInCart?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  price: Price;
  addedAt: string;
  _id: string;
  product?: Product;
  totalAmount?: number;
  variantType?: "SACHETS" | "STAND_UP_POUCH";
  isOneTime?: boolean;
  planDays?: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: Price;
  tax: Price;
  shipping: Price;
  discount: Price;
  total: Price;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  variantType?: "SACHETS" | "STAND_UP_POUCH";
  couponCode?: string;
  couponDiscountAmount?: number;
}

export interface GetCartResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
    suggestedProducts: Product[];
  };
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
  variant?: string;
  variantType?: string;
}

// Bulk add-to-cart payload used by quiz recommendations
export interface AddCartItemsRequest {
  productId: string;
  variantType: string;
  productId_1?: string;
  variantType_1?: string;
  productId_2?: string;
  variantType_2?: string;
  [key: string]: string | undefined;
}

export interface AddCartItemResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
  };
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
  };
}

export interface DeleteCartItemResponse {
  success: boolean;
  message: string;
  data: {
    cart: Cart;
  };
}

export interface ClearCartResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface ValidatedCartItem {
  productId: string;
  quantity: number;
  originalPrice: Price;
  isAvailable: boolean;
  isValid: boolean;
  isMember: boolean;
}

export interface CartPricing {
  subtotal: Price;
  originalSubtotal: Price;
  membershipDiscount: Price;
  tax: Price;
  shipping: Price;
  total: Price;
}

export interface ValidateCartResponse {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    errors: string[];
    cart: Cart;
    pricing: CartPricing;
    items: ValidatedCartItem[];
  };
}

// Checkout Page Summary Types
export interface CheckoutCartItem {
  productId: string;
  title: string;
  image: string;
  variant: string;
  quantity: number;
  variantType?: "SACHETS" | "STAND_UP_POUCH";
  basePlanPrice: {
    currency: string;
    amount: number;
    discountedPrice: number;
    planType: string;
    capsuleCount?: number;
    taxRate?: number;
  };
  membershipDiscount: number;
  taxRate?: number;
}

export interface SubscriptionPlan {
  planKey: string;
  label: string;
  durationDays: number;
  capsuleCount: number;
  totalAmount: number;
  discountedPrice: number;
  currency?: string;
  savePercentage: number;
  supplementsCount: number;
  perMonthAmount: number;
  perDeliveryAmount: number;
  features: string[];
  isRecommended: boolean;
  isSelected: boolean;
}

export interface CheckoutVariantPricing {
  subTotal: number;
  discountedPrice: number;
  membershipDiscountAmount: number;
  subscriptionPlanDiscountAmount?: number;
  taxAmount: number;
  total: number;
  currency: string;
}

export interface CheckoutPricing {
  sachets?: CheckoutVariantPricing;
  standUpPouch?: CheckoutVariantPricing;
  overall: {
    subTotal: number;
    discountedPrice: number;
    grandTotal: number;
    membershipDiscountAmount: number;
    subscriptionPlanDiscountAmount: number;
    couponDiscountAmount: number;
    taxAmount: number;
    currency: string;
  };
}

export interface CheckoutSuggestedProduct {
  productId: string;
  title: string;
  image: string;
  price: number;
  currency?: string;
  variant: string;
}

export interface CheckoutPageSummaryResponse {
  success: boolean;
  data: {
    cart: {
      items: CheckoutCartItem[];
      cartId?: string;
    };
    subscriptionPlans?: SubscriptionPlan[];
    sachetsPlans?: SubscriptionPlan[];
    standUpPouchPlans?: Record<string, SubscriptionPlan[]>;
    pricing: CheckoutPricing;
    suggestedProducts: CheckoutSuggestedProduct[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coupon?: any;
    billingAddressId?: string | null;
    shippingAddressId?: string | null;
    sachetsWarning?: string | null;
  };
}
