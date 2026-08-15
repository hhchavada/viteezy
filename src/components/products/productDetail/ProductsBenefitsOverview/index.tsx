import { memo } from "react";
import HeaderSection from "./HeaderSection";
import FeaturesGrid from "./FeaturesGrid";

interface ProductsBenefitsOverviewProps {
  productData?: any;
}

const ProductsBenefitsOverview = ({
  productData,
}: ProductsBenefitsOverviewProps) => {
  return (
    <section
      className="py-8 md:py-14 mx-2 mt-10 md:mt-20 radius-style relative overflow-hidden "
      aria-labelledby="why-choose-us-heading"
      style={{
        backgroundImage: productData?.specification?.bg_image
          ? `url(${productData.specification.bg_image})`
          : 'url("/products/noise-texture.png")',
        backgroundSize: productData?.specification?.bg_image ? "cover" : "auto",
        backgroundPosition: productData?.specification?.bg_image ? "center" : "0 0",
        backgroundRepeat: productData?.specification?.bg_image ? "no-repeat" : "repeat",
      }}
    >
      {/* Black overlay with 90% opacity */}
      <div className="absolute inset-0 bg-black/90 z-0 opacity-40" />

      <div className="mx-auto w-section max-auto pb-0 md:pb-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-12 lg:gap-10 xl:gap-12 justify-center items-center lg:items-start">
          {/* Left Section - Heading and Description */}
          <HeaderSection productData={productData} />

          {/* Right Section - 2x2 Grid of Features */}
          <FeaturesGrid productData={productData} />
        </div>
      </div>
    </section>
  );
};

// Memoize the main component to prevent unnecessary re-renders
export default memo(ProductsBenefitsOverview);
