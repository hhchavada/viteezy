import React from 'react';
import { useTranslations } from 'next-intl';

const HeaderSection: React.FC = () => {
    const t = useTranslations("Landing");
    return (
        <div className="text-center mb-8 px-4">
            <p className="font-saans text-black-color text-lg 3xl:text-xl font-normal mb-4 max-w-sm md:max-w-full mx-auto">
                {t("trustedByCompanies")}
            </p>
        </div>
    );
};

export default HeaderSection;