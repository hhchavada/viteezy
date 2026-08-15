/**
 * Wishlist API Types
 */

export interface WishlistItemProduct {
  _id: string;
  title: string;
  slug: string;
  productImage: string;
  shortDescription?: string;
  description?: string;
  nutritionInfo?: string;
  howToUse?: string;
  price: {
    currency: string;
    amount: number;
    taxRate: number;
    discountedPrice?: number;
  };
  originalPrice?: {
    currency: string;
    amount: number;
    taxRate?: number;
    discountedPrice?: number;
  };
  memberPrice?: {
    currency: string;
    amount: number;
    taxRate?: number;
  };
  variant?: string;
  hasStandupPouch?: boolean;
  sachetPrices?: {
    thirtyDays?: {
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
    [key: string]: unknown;
  };
  standupPouchPrice?: {
    [key: string]: unknown;
  };
  categories?: Array<{
    _id: string;
    slug: string;
    name: string;
    description?: string;
    image?: {
      type: string;
      url: string;
      sortOrder: number;
    };
  }>;
  ingredients?: unknown[];
  variants?: unknown[];
  galleryImages?: string[];
  isFeatured?: boolean;
  comparisonSection?: {
    title: string;
    columns: string[];
    rows: Array<{
      label: string;
      values: boolean[];
    }>;
  };
  specification?: {
    main_title: string;
    bg_image: string;
    items: Array<{
      title: string;
      descr: string;
      image: string;
      imageMobile?: string;
    }>;
  };
  status?: boolean;
  createdAt: string;
  updatedAt: string;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
  averageRating?: number;
  ratingCount?: number;
  is_liked?: boolean;
  isMember?: boolean;
  [key: string]: unknown;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  product: WishlistItemProduct;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleWishlistRequest {
  productId: string;
  status: number;
}

export interface ToggleWishlistResponse {
  success: boolean;
  message: string;
  data?: WishlistItem;
}

export interface GetWishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

