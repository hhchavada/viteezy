import MainLayout from "@/components/layouts/MainLayout";
import ProductDetail from "@/components/products/ProductDetail";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage(props: ProductDetailPageProps) {
  const { params } = props;
  const { id } = await params;
  return (
    <MainLayout
      headerClassName="border-b border-slate-border-color"
    >
      <ProductDetail key={`product-${id}`} productId={id} />{" "}
    </MainLayout>
  );
}
