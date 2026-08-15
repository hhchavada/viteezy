/**
 * Product API Types
 */

export interface Product {
  _id: string;
  title: string;
  description?: string;
  price: {
    amount: number;
  };
  productImage: string;
  category?: string;
  stock?: number;
  is_liked?: boolean;
}

export interface GetProductsResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type CategoryProduct = {
  _id: string;
  title: string;
  slug: string;
  productImage?: string;
  galleryImages?: string[];
  shortDescription?: string;
  is_liked?: boolean;
};

export type CategoryWithProducts = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string | null;
  image?: { type: string; url: string; sortOrder?: number } | null;
  products?: CategoryProduct[];
};

export type CategoriesWithProductsResponse = {
  success: boolean;
  message: string;
  data: { categories: CategoryWithProducts[] };
};

export type ProductCategory = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder?: number;
  icon?: string | null;
  image?: { type: string; url: string; sortOrder?: number } | null;
  productCount?: number;
};

export type GetProductCategoriesResponse = {
  success: boolean;
  message?: string;
  data: {
    categories: ProductCategory[];
  };
};

export type ProductGoal = {
  _id: string;
  title: string;
  icon?: string;
};

export type GetProductGoalsResponse = {
  success: boolean;
  message?: string;
  data: {
    goals: ProductGoal[];
  };
};

export type ProductIngredientOption = {
  _id: string;
  name: string;
  description?: string;
  image?: { type: string; url: string; sortOrder?: number } | null;
  isActive?: boolean;
};

export type GetProductIngredientsResponse = {
  success: boolean;
  message?: string;
  data: ProductIngredientOption[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type ProductFilterCategory = {
  _id: string;
  slug: string;
  name: string;
  icon?: string | null;
};

export type ProductFilterIngredient = {
  _id: string;
  name: string;
};

export type ProductFiltersResponse = {
  success: boolean;
  message?: string;
  data: {
    categories: ProductFilterCategory[];
    healthGoals: string[];
    ingredients: ProductFilterIngredient[];
    variants: string[];
    hasStandupPouch: boolean[];
    status: boolean[];
    sortBy: Array<{ label: string; value: string }>;
  };
};

export type SimilarProduct = {
  _id: string;
  title: string;
  productImage?: string;
  shortDescription?: string;
  hasStandupPouch?: boolean;
  originalPrice?: { amount?: number; currency?: string };
  price?: { amount?: number; currency?: string };
  memberPrice?: { amount?: number; currency?: string };
  sachetPrices?: {
    thirtyDays?: {
      amount?: number;
      discountedPrice?: number;
      currency?: string;
    };
  };
};

export type GetProductByIdResponse = {
  success: boolean;
  message?: string;
  data: {
    product: Record<string, unknown>;
    similarProducts?: SimilarProduct[];
  };
};
