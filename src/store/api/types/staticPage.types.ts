import { ApiResponse } from "./common.types";

export interface StaticPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export interface StaticPageResponseData {
  page: StaticPageData;
}

export interface StaticPagesListResponseData {
  pages: StaticPageData[];
}

export type GetStaticPageResponse = ApiResponse<StaticPageResponseData>;
export type GetStaticPagesListResponse = ApiResponse<StaticPagesListResponseData>;
