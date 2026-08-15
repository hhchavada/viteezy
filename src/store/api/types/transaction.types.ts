export interface TransactionSubscriptionItem {
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

export interface TransactionSubscription {
  id: string;
  subscriptionNumber: string;
  status: string;
  planType: string;
  cycleDays: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  nextDeliveryDate: string;
  nextBillingDate: string;
  lastBilledDate: string;
  isAutoRenew: boolean;
  renewalCount: number;
  items: TransactionSubscriptionItem[];
}

export interface Transaction {
  id: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  amount: number;
  currency: string;
  taxRate: number;
  processedAt: string;
  orderId: string;
  membershipId: string | null;
  subscriptionId: string;
  createdAt: string;
  subscription?: TransactionSubscription;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetTransactionsBySubscriptionResponse {
  success: boolean;
  message: string;
  data: Transaction[];
  pagination: Pagination;
}
