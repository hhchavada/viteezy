// Order API Types

export interface OrderSachetsPayload {
  planDurationDays: number;
  isOneTime: boolean;
}

export interface OrderStandUpPouchItemQuantity {
  capsuleCount: number;
  productId: string;
  quantity: number;
}

export interface OrderStandUpPouchPayload {
  itemQuantities: OrderStandUpPouchItemQuantity[];
}

export interface OrderVariantPricing {
  subTotal: number;
  discountedPrice: number;
  membershipDiscountAmount: number;
  subscriptionPlanDiscountAmount?: number;
  taxAmount: number;
  total: number;
  currency: string;
}

export interface OrderPricingPayload {
  sachets?: OrderVariantPricing;
  standUpPouch?: OrderVariantPricing;
  overall: {
    subTotal: number;
    discountedPrice: number;
    couponDiscountAmount: number;
    membershipDiscountAmount: number;
    subscriptionPlanDiscountAmount: number;
    taxAmount: number;
    grandTotal: number;
    currency: string;
  };
}

export interface CreateOrderRequest {
  cartId: string;
  sachets?: OrderSachetsPayload;
  standUpPouch?: OrderStandUpPouchPayload;
  shippingAddressId: string;
  pricing: OrderPricingPayload;
  paymentMethod: string;
  couponCode?: string;
  orderedFor?: string;
  relationshipType?: string;
}

// Product details in order item
export interface OrderProductDetails {
  _id: string;
  title: string;
  slug: string;
  description: string;
  productImage: string;
  categories: string[];
  galleryImages: string[];
  status: boolean;
}

// Order item with full product details
export interface OrderItem {
  productId: OrderProductDetails;
  name: string;
  amount: number;
  discountedPrice: number;
  taxRate: number;
  totalAmount: number;
  durationDays: number;
  capsuleCount: number;
  savingsPercentage: number;
  features: string[];
}

// Pricing details
export interface OrderPricing {
  subTotal: number;
  discountedPrice: number;
  couponDiscountAmount: number;
  membershipDiscountAmount: number;
  subscriptionPlanDiscountAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
}

// Shipping address details
export interface ShippingAddress {
  _id: string;
  firstName: string;
  lastName: string;
  streetName: string;
  houseNumber: string;
  houseNumberAddition: string | null;
  postalCode: string;
  address: string;
  phone: string;
  country: string;
  city: string;
  note: string | null;
}

// Payment details
export interface OrderPayment {
  id: string;
  paymentMethod: string;
  status: string;
  amount: {
    currency: string;
    amount: number;
    taxRate: number;
  };
  currency: string;
  transactionId: string | null;
  gatewayTransactionId: string;
  failureReason: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  processedAt: string;
  createdAt: string;
}

// Order metadata
export interface OrderMetadata {
  planDetails: {
    planDurationDays: number;
    isOneTime: boolean;
    variantType: string;
    interval: string;
    cycleDays: number;
  };
  paymentSessionId: string;
  orderConfirmationEmailSentAt: string;
}

// Full order details
export interface Order {
  id: string;
  orderNumber: string;
  planType: string;
  isOneTime: boolean;
  variantType: string;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
  pricing: OrderPricing;
  shippingAddressId: ShippingAddress;
  billingAddressId: ShippingAddress | null;
  paymentMethod: string;
  payment: OrderPayment;
  couponCode: string | null;
  notes: string | null;
  metadata: OrderMetadata;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    paymentUrl?: string;
  };
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface GetOrderByIdResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}
