import HomeBase from "@/components/home";
import MainLayout from "@/components/layouts/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      <div className="min-h-screen">
        <HomeBase />
      </div>
    </MainLayout>
  );
}
