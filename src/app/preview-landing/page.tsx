import Footer from "@/components/footer";
import Header from "@/components/header";
import HomeBase from "@/components/home";
import DisableClicksInPreview from "@/components/preview/DisableClicksInPreview";

export default function PreviewLandingPage() {
  return (
    <>
      <DisableClicksInPreview />
      <Header />
      <div className="pt-[116px]">
        <HomeBase />
      </div>
      <Footer />
    </>
  );
}
