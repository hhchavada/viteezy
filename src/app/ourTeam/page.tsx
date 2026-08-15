import MainLayout from "@/components/layouts/MainLayout";
import OurTeamBase from "@/components/ourTeam";
import React from "react";

const OurTeam = () => {
  return (
    <MainLayout headerClassName="border-b border-[#e9e8d7]">
      <div className="bg-off-white-color min-h-screen">
        <OurTeamBase />
      </div>
    </MainLayout>
  );
};

export default OurTeam;
