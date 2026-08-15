/**
 * Blog API Types
 */

export interface Category {
    _id: string;
    slug: string;
    title: string;
    isActive: boolean;
    blogCount: number;
}

export interface BlogBanner {
    _id: string;
    banner_image: {
        type: string;
        url: string;
        sortOrder: number;
    } | null;
    heading: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface Blog {
    _id: string;
    title: string;
    description: string;
    coverImage: string | null;
    viewCount: number;
    createdAt: string;
    category: {
        _id: string;
        slug: string;
        title: string;
    };
    seo?: {
        metaTitle: string;
        metaDescription: string;
        metaSlug: string;
    };
}

export interface GetBlogsResponse {
    success?: boolean;
    message?: string;
    data?: {
        blogs: Blog[];
        blogBanners: BlogBanner[];
    };
    pagination?: {
        page: number;
        pages: number;
        limit: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface GetCategoriesResponse {
    success?: boolean;
    message?: string;
    data: {
        categories: Category[];
    };
}

export interface GetPopularBlogsResponse {
    success?: boolean;
    message?: string;
    data: {
        blogs: Blog[];
    };
}

export interface GetBlogByIdResponse {
    success?: boolean;
    message?: string;
    data: {
        blog: Blog & {
            author: any | null;
        };
    };
}
