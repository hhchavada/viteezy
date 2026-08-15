// Types
export interface IconProps {
    className?: string;
}

export interface BenefitItem {
    id: string;
    icon: React.ComponentType<IconProps>;
    title: string;
    description: string;
    type?: string;
}

export interface BenefitCardProps {
    benefit: BenefitItem;
    layout?: 'column' | 'row';
}

export interface StatItem {
    value: string
    label: string
}

export interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}
export interface ProductsBenefits {
    image: string;
    title: string;
    description: string;
}

export interface InsightCard {
    id: number;
    image: string;
    author: string;
    date: string;
    title: string;
    description: string;
}

export interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export type StepType = {
    id: number;
    title: string;
    description: string;
    imageAlt: string;
    image: string;
};
export interface DesktopStepProps {
    step: StepType;
    showArrow: boolean;
}

// Mobile Step Component
export interface MobileStepProps {
    step: StepType;
}

export interface ProductDetailProps {
    productId: string
}

export interface Product {
    id: string
    name: string
    description: string
    price: number
    originalPrice: number
    currency?: string
    rating: number
    reviewCount: number
    images: {
        front: string
        gallery: string[]
    }
    category: string
    inStock: boolean
}

export interface CartItemData {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    image: string;
    description: string;
    variantType?: "STAND_UP_POUCH" | "SACHETS";
    planDays?: number | null;
    capsuleCount?: number | null;
    isOneTime?: boolean;
    membershipDiscount?: number;
    currency?: string;
}

export interface ProductSuggestion {
    id: string;
    title: string;
    description: string;
    image: string;
    variantType: "STAND_UP_POUCH" | "SACHETS";
    planDays?: number;
}



