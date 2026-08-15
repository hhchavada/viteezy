import React, { memo } from 'react';
import HeaderSection from './HeaderSection';
import BrandsCarousel from './BrandsCarousel';

export function BrandsMarquee() {
    return (
        <section className="w-full -mb-7 section-pb">
            <div className="">
                <HeaderSection />
                <BrandsCarousel />
            </div>
        </section>
    );
}

export default memo(BrandsMarquee)
