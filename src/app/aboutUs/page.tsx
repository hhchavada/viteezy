import AboutUsPage from "@/components/aboutUs";
import MainLayout from "@/components/layouts/MainLayout";
import React from "react";

const AboutUs = () => {
  return (
    <MainLayout headerClassName="border-b border-[#e9e8d7]">
      <div className="bg-off-white-color min-h-screen">
        <AboutUsPage />
      </div>
    </MainLayout>
  );
};

export default AboutUs;
