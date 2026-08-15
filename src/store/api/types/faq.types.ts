import { ApiResponse } from "./common.types";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
}

export interface FaqCategory {
  categoryId: string;
  categoryTitle: string;
  categorySlug: string;
  /** From API: category image URL (optional) */
  categoryImage?: string | null;
  articleImage?: string;
  faqs: FaqItem[];
}

export interface FaqResponseData {
  categories: FaqCategory[];
}

export type GetFaqsResponse = ApiResponse<FaqResponseData>;
