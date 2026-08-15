import BlogPage from "@/components/blog";
import MainLayout from "@/components/layouts/MainLayout";

export default function Blog() {
  return (
    <MainLayout headerClassName="bg-white">
      <div className="min-h-screen">
        <BlogPage />
      </div>
    </MainLayout>
  );
}
