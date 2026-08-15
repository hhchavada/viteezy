"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ScrollSmootherComponent from "@/components/ui/scrollSmootherComponent";
import AOSWrapper from "@/components/ui/aosWrapper";
import PageContentWrapper from "@/components/ui/pageContentWrapper";
import MobileMenu from "@/components/header/MobileMenu";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isQuiz = pathname?.startsWith("/quiz") ?? false;

  if (isQuiz) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollSmootherComponent />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <AOSWrapper>
            <PageContentWrapper>
              <Header />
              <main>{children}</main>
              <Footer />
            </PageContentWrapper>
          </AOSWrapper>
        </div>
      </div>
      <MobileMenu />
    </>
  );
}
