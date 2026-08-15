// Type definitions for MegaMenuDropdown components

export interface SubCategoryItem {
  img?: string;
  title: string;
  description: string;
}

export interface CategoryItem {
  title: string;
  slug: string;
  children?: SubCategoryItem[];
  subMenu?: SubCategoryItem[];
}
