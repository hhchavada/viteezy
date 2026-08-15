import { SubCategoryItem } from "@/components/types/header";
import FallbackImage from "@/components/ui/fallbackImage";
import { CategoryProduct } from "@/store/api/types/product.types";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";

interface SubCategoryProps {
  data: CategoryProduct;
  idx: number;
}

const SubCategory: React.FC<SubCategoryProps> = ({ data, idx }) => {
  console.log(data);
  const title = data?.title;
  const description = data?.shortDescription;
  const productImage = data?.productImage;
  const id = data?._id;

  return (
    <Link href={`/products/${id}`} className="group cursor-pointer">
      <FallbackImage
        width={300}
        height={700}
        // src="/review1.png"
        src={productImage}
        alt="subcategory-product"
        // className="max-h-[275px] aspect-square group-hover:scale-105 transition-all duration-500 object-cover"
        className="max-h-[275px] aspect-square group-hover:scale-105 transition-all duration-500 object-cover h-auto w-auto rounded-xl"
      />
      <h3 className="text-xl font-bold mt-6 mb-2">{title}</h3>
      <p className="sub-heading-style word-break line-clamp-2">{description}</p>
    </Link>
  );
};

export default memo(SubCategory);
