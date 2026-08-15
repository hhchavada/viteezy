import MainLayout from "@/components/layouts/MainLayout";
import ProductsPage from "@/components/products";
import React from "react";

export default function Products() {
  return (
    <MainLayout headerClassName="bg-white border-0">
      <div className="min-h-screen" key="products-list">
        <ProductsPage />
      </div>
    </MainLayout>
  );
}
