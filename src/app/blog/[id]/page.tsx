import BlogDetailPage from "@/components/blog/BlogDetail";
import MainLayout from "@/components/layouts/MainLayout";

export default function BlogDetail() {
  return (
    <MainLayout headerClassName="bg-white border-b border-slate-border-color">
      <div className="min-h-screen">
        <BlogDetailPage />
      </div>
    </MainLayout>
  );
}
