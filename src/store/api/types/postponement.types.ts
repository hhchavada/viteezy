export interface PostponementOrderRef {
  _id: string;
  orderNumber: string;
  status: string;
  planType: string;
}

export interface Postponement {
  _id: string;
  orderId: PostponementOrderRef;
  userId: string;
  originalDeliveryDate: string;
  requestedDeliveryDate: string;
  /** When approved, API may return the confirmed delivery date */
  approvedDeliveryDate?: string;
  reason?: string;
  status: string;
  subscriptionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostponementPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetPostponementsBySubscriptionResponse {
  success: boolean;
  message: string;
  data: Postponement[];
  pagination: PostponementPagination;
}

export interface CreatePostponementRequest {
  orderId: string;
  requestedDeliveryDate: string; // YYYY-MM-DD
  reason?: string;
}

export interface CreatePostponementResponse {
  success: boolean;
  message: string;
  data?: Postponement;
}
