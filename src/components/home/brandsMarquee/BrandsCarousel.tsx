import React from 'react';
import { Marquee } from "@/components/ui/marquee";
import { brands } from "@/components/constants";
import BrandLogo from './BrandLogo';

const BrandsCarousel: React.FC = () => {
    return (
        <div className="relative flex w-full overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
                {brands.map((brand, index) => (
                    <BrandLogo key={`${brand.name}-${index}`} {...brand} />
                ))}
            </Marquee>
        </div>
    );
};

export default BrandsCarousel;