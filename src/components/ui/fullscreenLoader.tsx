import FixedPortal from "@/components/ui/fixedPortal";
import React from "react";
import Spinner from "./spinner";

const FullscreenLoader = ({ loading = false }) => {
  return (
    <FixedPortal>
      <div className="min-h-screen flex items-center justify-center fixed top-0 start-0 bg-white w-full z-999">
        <Spinner size="lg" color="teal-green" />
      </div>
    </FixedPortal>
  );
};

export default FullscreenLoader;
