/* eslint-disable @next/next/no-img-element */
import React from "react";

interface BrandLogoProps {
  logo: string;
  name: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ logo, name }) => {
  return (
    <div className="flex items-center justify-center px-8 py-4">
      <img
        src={logo}
        alt={name}
        className="h-14 w-auto grayscale opacity-60 hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export default BrandLogo;
