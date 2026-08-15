import { FreeShippingIcon, PackageIcon, TruckIcon } from "@/components/icons";
import {
  DiscoveryRecommendationIcon,
  ExpertHealthAdvisorsIcon,
  TrustedQualityIcon,
  WorkOnGoalsIcon,
} from "@/components/icons";
import {
  BenefitItem,
  CartItemData,
  FAQItem,
  FeatureItem,
  InsightCard,
  ProductsBenefits as IProductsBenefits,
  ProductSuggestion,
  StatItem,
} from "../types";
export const products = [
  {
    id: 1,
    title: "Wellness Best Sellers",
    description:
      "Our best sellers, bottled. Available with or without subscription.",
    buttonText: "Shop Specialties",
    image: "/api/placeholder/280/320",
  },
  {
    id: 2,
    title: "Nature's Healing Spices",
    description:
      "Natural spices adding flavor and powerful health benefits together.",
    buttonText: "Shop Spices",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    title: "Minerals that Matter",
    description:
      "Essential minerals to strengthen your body and improve overall wellness.",
    buttonText: "Shop Minerals",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    title: "Minerals that Matter",
    description:
      "Essential minerals to strengthen your body and improve overall wellness.",
    buttonText: "Shop Minerals",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    title: "Minerals that Matter",
    description:
      "Essential minerals to strengthen your body and improve overall wellness.",
    buttonText: "Shop Minerals",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    title: "Minerals that Matter",
    description:
      "Essential minerals to strengthen your body and improve overall wellness.",
    buttonText: "Shop Minerals",
    image: "/api/placeholder/280/320",
  },
  {
    id: 3,
    title: "Minerals that Matter",
    description:
      "Essential minerals to strengthen your body and improve overall wellness.",
    buttonText: "Shop Minerals",
    image: "/api/placeholder/280/320",
  },
];

export const stats: StatItem[] = [
  { value: "3000+", label: "Happy customers worldwide" },
  { value: "15+", label: "Cities Where we are" },
  { value: "10+", label: "Inhouse experts" },
  { value: "5 Star", label: "Reviews from customers" },
];

export const steps = [
  {
    id: 1,
    title: "Complete Assessment",
    description:
      "Answer questions about your health, lifestyle, and wellness goals to help our AI understand your unique needs.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=face",
    alt: "Health assessment questionnaire",
  },
  {
    id: 2,
    title: "AI Analysis",
    description:
      "Our advanced algorithm analyzes your data and creates a personalized vitamin and supplement regimen.",
    image:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&crop=center",
    alt: "AI analyzing health data",
  },
  {
    id: 3,
    title: "Receive & Thrive",
    description:
      "Get your custom vitamin pack delivered monthly and track your progress with our wellness dashboard.",
    image:
      "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=400&h=400&fit=crop&crop=face",
    alt: "Person receiving vitamin supplements",
  },
];

export const benefitsData: BenefitItem[] = [
  {
    id: "free-shipping",
    icon: FreeShippingIcon,
    type:"icon",
    title: "freeShippingTitle",
    description: "freeShippingDescription",
  },
  {
    id: "exclusive-discounts",
    icon: PackageIcon,
    type:"icon",
    title: "exclusiveDiscountsTitle",
    description: "exclusiveDiscountsDescription",
  },
  {
    id: "fast-delivery",
    icon: TruckIcon,
    type:"icon",
    title: "fastDeliveryTitle",
    description: "fastDeliveryDescription",
  },
];

export const features: FeatureItem[] = [
  {
    icon: <ExpertHealthAdvisorsIcon />,
    title: "Expert Health Advisors",
    description:
      "Connect with certified health professionals for trusted, personalized advice tailored to your unique wellness needs.",
  },
  {
    icon: <WorkOnGoalsIcon />,
    title: "Work on your goals",
    description:
      "Experts recommend at least 90 days of consistent use of supplements for optimal results.",
  },
  {
    icon: <DiscoveryRecommendationIcon />,
    title: "Discover your recommendation",
    description:
      "Within minutes you will receive a personalized vitamin plan completely tailored to you!",
  },
  {
    icon: <TrustedQualityIcon />,
    title: "Trusted Quality",
    description:
      "Every formula is made with rigorously tested, high-quality ingredients to ensure safety and effectiveness.",
  },
];

export const customerReviews = [
  {
    id: 1,
    image: "/review1.png",
    videoThumbnail:
      "https://i.pinimg.com/originals/46/41/61/4641611401ecb508c625eebe448da663.gif",
    price: "$30.601",
    originalPrice: "$36.00",
    productName: "1MRP Inclusive of all taxes",
  },
  {
    id: 2,
    image: "/review1.png",
    videoThumbnail: "/video-thumb2.jpg",
    price: "$30.602",
    originalPrice: "$36.00",
    productName: "2MRP Inclusive of all taxes",
  },
  {
    id: 3,
    image: "/review1.png",
    videoThumbnail: "/video-thumb3.jpg",
    price: "$30.603",
    originalPrice: "$36.00",
    productName: "3MRP Inclusive of all taxes",
  },
  {
    id: 4,
    image: "/review1.png",
    videoThumbnail: "/video-thumb4.jpg",
    price: "$30.604",
    originalPrice: "$36.00",
    productName: "4MRP Inclusive of all taxes",
  },
  {
    id: 5,
    image: "/review1.png",
    videoThumbnail: "/video-thumb5.jpg",
    price: "$30.605",
    originalPrice: "$36.00",
    productName: "5MRP Inclusive of all taxes",
  },
  {
    id: 6,
    image: "/review1.png",
    videoThumbnail: "/video-thumb6.jpg",
    price: "$30.606",
    originalPrice: "$36.00",
    productName: "6MRP Inclusive of all taxes",
  },
  {
    id: 7,
    image: "/review1.png",
    videoThumbnail: "/video-thumb7.jpg",
    price: "$30.607",
    originalPrice: "$36.00",
    productName: "7MRP Inclusive of all taxes",
  },
];

export const insights: InsightCard[] = [
  {
    id: 1,
    image: "/wellness01.jpg",
    author: "Power supply",
    date: "May 8, 2024",
    title: "Are blueberries healthy? Here are the 6 benefits!",
    description:
      "Menopause: a notorious period. We explain the different phases of menopause and what you can expect.",
  },
  {
    id: 2,
    image: "/wellness03.jpg",
    author: "Power supply",
    date: "May 8, 2024",
    title: "Are blueberries healthy? Here are the 6 benefits!",
    description:
      "Menopause: a notorious period. We explain the different phases of menopause and what you can expect.",
  },
  {
    id: 3,
    image: "/wellness02.jpg",
    author: "Power supply",
    date: "May 8, 2024",
    title: "4 stages of menopause: what to expect",
    description:
      "Menopause: a notorious period. We explain the different phases of menopause and what you can expect.",
  },
];

export const brands = [
  {
    name: "Forbes",
    logo: "/logos/forbes.svg",
  },
  {
    name: "Sheerluxe",
    logo: "/logos/sheerluxe.svg",
  },
  {
    name: "Grazia",
    logo: "/logos/grazia.svg",
  },
  {
    name: "Boots",
    logo: "/logos/boots.svg",
  },
  {
    name: "Forbes",
    logo: "/logos/forbes.svg",
  },
  {
    name: "Sheerluxe",
    logo: "/logos/sheerluxe.svg",
  },
  {
    name: "Grazia",
    logo: "/logos/grazia.svg",
  },
];

export const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Why do you use so much plastic?",
    answer:
      "We understand your concern about plastic usage. We're committed to sustainable packaging and are continuously working to reduce our environmental impact. We use minimal, recyclable packaging materials and are exploring eco-friendly alternatives. Our focus is on delivering your health supplements safely while minimizing waste.",
  },
  {
    id: 2,
    question: "When does the direct debit take place?",
    answer:
      "Direct debit payments are processed on the same date each month as your initial subscription start date. For example, if you started your subscription on the 15th, your payment will be automatically deducted on the 15th of each month. You'll receive an email notification 3 days before each payment is processed.",
  },
  {
    id: 3,
    question: "How many sachets do I have per day?",
    answer:
      "The number of sachets per day depends on your personalized health plan created by our health experts. Typically, most customers receive 1-2 sachets daily, but this can vary based on your specific nutritional needs, health goals, and assessment results. Your personalized plan will clearly indicate the recommended daily intake.",
  },
  {
    id: 4,
    question: "Can I still adjust/expand my vitamin recommendation?",
    answer:
      "Absolutely! Your health needs may change over time, and we want to support that journey. You can update your health assessment, adjust your vitamin recommendations, or add new supplements through your customer dashboard. Our health advisors are also available to help you modify your plan based on lifestyle changes, new health goals, or updated lab results.",
  },
  {
    id: 5,
    question: "How do I contact Viteezy?",
    answer:
      "We're here to help! You can reach our customer support team through multiple channels: email us at support@viteezy.com, use the live chat feature on our website, call our customer service line during business hours, or message us through your customer account. Our team typically responds within 24 hours and is ready to assist with any questions about your supplements or account.",
  },
  {
    id: 6,
    question: "Where can I view and adjust my membership?",
    answer:
      "You can manage your entire membership through your personal customer dashboard. Simply log in to your account where you can view your current subscription, upcoming deliveries, payment history, modify your supplement plan, update your shipping address, pause or cancel your subscription, and access your personalized health recommendations. The dashboard is available 24/7 for your convenience.",
  },
];

export const stepsData = [
  {
    id: 1,
    title: "Research",
    description:
      "Viteezy design solutions backed by 10,000+ trials and studies.",
    imageAlt: "Research - Scientist with microscope",
    image: "/step1.jpg",
  },
  {
    id: 2,
    title: "Development and Testing",
    description:
      "We follow strict protocols and lab testing to ensure safe, trusted results.",
    imageAlt: "Development and Testing - Lab equipment",
    image: "/step2.jpg",
  },
  {
    id: 3,
    title: "Continuous Analysis",
    description: "Viteezy analyze user data to prove and improve solutions.",
    imageAlt: "Continuous Analysis - Person analyzing data",
    image: "/step3.png",
  },
] as const;

export const categories = [
  { id: "spices", label: "Spices" },
  { id: "minerals", label: "Minerals" },
  { id: "specialties", label: "Specialties" },
  { id: "vitamins", label: "Vitamins" },
];

export const sortOptions = [
  { id: "relevance", label: "relevance" },
  // { id: "best-selling", label: "bestSelling" },
  // { id: "alphabetical-az", label: "alphabeticalAZ" },
  // { id: "alphabetical-za", label: "alphabeticalZA" },
  { id: "priceLowToHigh", label: "priceLowToHigh" },
  { id: "priceHighToLow", label: "priceHighToLow" },
  { id: "rating", label: "topRated" },
];

export const ProductsBenefits: IProductsBenefits[] = [
  {
    image: "/products/ProductsBenefits4.png",
    title: "Boost Energy Naturally",
    description:
      "Keeps you active without jitters, boosting stamina and endurance.",
  },
  {
    image: "/products/ProductsBenefits2.png",
    title: "100% Vegan & Gluten-Free",
    description:
      "Made with clean, plant-based ingredients for health and wellness.",
  },
  {
    image: "/products/ProductsBenefits1.png",
    title: "Expert Health Advisors",
    description:
      "Connect with certified health professionals for trusted, personalized advice tailored to your unique wellness needs.",
  },
  {
    image: "/products/ProductsBenefits3.png",
    title: "Immune Support",
    description:
      "Packed with essential vitamins & minerals for daily wellness.",
  },
];

// Accordion data
export const accordionItems = [
  {
    id: "description",
    title: "Description",
    content:
      "Green Tea Extract is a powerful antioxidant supplement derived from the leaves of Camellia sinensis. It supports metabolism, provides natural energy, and promotes overall wellness with its rich polyphenol content.",
  },
  {
    id: "ingredients",
    title: "Ingredients",
    content:
      "Green Tea Extract (Camellia sinensis leaf), Vegetable Cellulose (capsule), Rice Flour, Magnesium Stearate. Contains 50% EGCG (Epigallocatechin Gallate).",
  },
  {
    id: "nutrition",
    title: "Nutrition Info",
    content:
      "Serving Size: 1 Capsule. Servings Per Container: 60. Green Tea Extract: 500mg. EGCG: 250mg. Caffeine: 25mg.",
  },
  {
    id: "howToUse",
    title: "How to Use",
    content:
      "Take 1-2 capsules daily with meals. For best results, take in the morning or early afternoon. Do not exceed recommended dosage. Consult your healthcare provider before use.",
  },
];

// Similar products data
export const similarProducts = [
  {
    id: "1",
    name: "Energy Bundle",
    description: "A good source of protein, ideal for an active lifestyle",
    price: 15.22,
    originalPrice: 19.59,
    image: "/products/pro_detail0.png",
  },
  {
    id: "2",
    name: "Energy Bundle",
    description: "A good source of protein, ideal for an active lifestyle",
    price: 15.22,
    originalPrice: 19.59,
    image: "/products/pro_detail0.png",
  },
  {
    id: "3",
    name: "Energy Bundle",
    description: "A good source of protein, ideal for an active lifestyle",
    price: 15.22,
    originalPrice: 19.59,
    image: "/products/pro_detail0.png",
  },
  {
    id: "4",
    name: "Energy Bundle",
    description: "A good source of protein, ideal for an active lifestyle",
    price: 15.22,
    originalPrice: 19.59,
    image: "/products/pro_detail0.png",
  },
];

export const items = [
  {
    title: "Chlorella",
    desc: "Grown in Oldenzaal (the Netherlands) in closed fermentation tanks for the highest possible quality. Rich in B vitamins, including B12.",
    img: "/products/prod_detail01.png",
  },
  {
    title: "Wakame",
    desc: "Grown in Brittany, France, in a protected marine ecosystem, wakame is a natural source of iodine and packed with fiber and minerals.",
    img: "/products/prod_detail01.png",
  },
  {
    title: "Spirulina",
    desc: "Grown in Catalonia (Spain) and dried at a low temperature to preserve nutritional value, spirulina contains calcium, iron, and the antioxidant phycocyanin.",
    img: "/products/prod_detail01.png",
  },
  {
    title: "Lithothamnion",
    desc: "Collected along the coast of Iceland, exclusively from naturally occurring seaweed, Lithothamnion is a mineral-rich source of calcium and magnesium.",
    img: "/products/prod_detail01.png",
  },
];

// Mock data for products suggestions
export const mockProductSuggestions: ProductSuggestion[] = [
  {
    id: "1",
    title: "Iron",
    description: "30 capsules",
    image: "/products/pro_detail0.png",
    variantType: "SACHETS",
  },
  {
    id: "2",
    title: "Iron",
    description: "30 capsules",
    image: "/products/pro_detail0.png",
    variantType: "SACHETS",
  },
  {
    id: "3",
    title: "Iron",
    description: "30 capsules",
    image: "/products/pro_detail0.png",
    variantType: "SACHETS",
  },
  {
    id: "4",
    title: "Iron",
    description: "30 capsules",
    image: "/products/pro_detail0.png",
    variantType: "SACHETS",
  },
  {
    id: "5",
    title: "Iron",
    description: "30 capsules",
    image: "/products/pro_detail0.png",
    variantType: "SACHETS",
  },
];

// Mock data for cart items
export const mockCartItems: CartItemData[] = [
  {
    productId: "1",
    id: "1",
    title: "Green Tea Extract",
    description: "30 capsules",
    price: 13.95,
    quantity: 1,
    image: "/products/pro_detail0.png",
  },
  {
    productId: "2",
    id: "2",
    title: "Green Tea Extract",
    description: "30 capsules",
    price: 23.25,
    quantity: 1,
    image: "/products/pro_detail0.png",
  },
];

export const blogData = {
  id: 1,
  title: "Are blueberries healthy? Here are the 6 benefits!",
  author: "Power supply",
  date: "May 8, 2024",
  image: "/blog/blog-detail.png",
  content: `
            <p>Blueberries are a fruit that's becoming increasingly popular. They're practically indispensable in a smoothie bowl and you're, But are blueberries actually healthy? In this article, we'll delve into the various health benefits of this small berry.</p>

            <h2>Are blueberries healthy?</h2>
            <p>Blueberries are incredibly healthy. They're packed with beneficial nutrients like vitamin C, K, manganese, and flavonoids. This makes them full of antioxidants, which can provide many health benefits to you. Read on for all the benefits.</p>
            <p>There's a whole list of benefits. It's definitely not a bad idea to include blueberries in your diet. We'll explain all these health benefits in more detail.</p>

            <h2>1. Good for blood pressure</h2>
            <p>First and foremost, eating blueberries can have such a positive effect on you. Think of things like lowering and help relieve oxidative stress.</p>
            <p>But you've probably also seen that it also has a positive effect on your blood pressure. As you can in a meal, people have noticed that this also had positive results in people with heart diseases. That healthy.</p>

            <h2>2. Promotes digestion</h2>
            <p>Digestive problems are incredibly annoying. Think of stomach pain and cramping, for example. Prevention is better than cure.</p>
            <p>Unlike prevalent, blueberries are good for your digestion [3] That's because all the healthy substances in the berries, dietary fibers, and vitamins.</p>
            <p>By the way, blueberries are also full of prebiotic, which are important substances found in whole grain products and other food. You've probably heard that fiber is a good aid for your digestion. These berries are also good for your eyes 05.</p>

            <img src="/blog/blog-content-img.png" alt="Blueberries in yogurt" />

            <h2>3. Maintaining vision</h2>
            <p>We may never really think about it, but our eyes are good for our eyes. But you have some deciding on where blueberries are too bad.</p>
            <p>There are substances in those berries – those we called anthocyanin – that are good for your eyes [4]. These are the berries are also good for your brain [5].</p>
        
            <h2>4. Healthy for the brain</h2>
            <p>We may never really think about it, but has something really are good for your brain. And that's very important. In fact, you need them to everything you do.</p>
            <p>And that's why it's so important. The antioxidants in blueberries may delay brain aging and improve memory deepest levels. But there's not just a very important one in the role of your diet.</p>

            <h2>5. Anti-inflammatory effect</h2>
            <p>Inflammation, that's a problem. Everyone faces it sometimes. We're not talking about acute injury. We're talking about a chronic state of inflammation within.</p>
            <p>But you also know that we at the DNA level we call inflammation (or damage) in them we also been reason that it's very 'healthy' for you.</p>

            <h2>6. May help reduce muscle damage</h2>
            <p>The antioxidants in blueberries can help reduce muscle damage after strenuous exercise. This makes them an excellent post-workout snack for athletes and fitness enthusiasts.</p>
            
            <h3>Key Benefits Summary:</h3>
            <ul>
                <li>Rich in antioxidants and vitamins</li>
                <li>Supports cardiovascular health</li>
                <li>Improves brain function and memory</li>
                <li>Aids in blood sugar regulation</li>
                <li>Promotes digestive health</li>
                <li>Reduces muscle damage after exercise</li>
            </ul>

            <p>With all these amazing benefits, it's clear that blueberries deserve their superfood status. Make them a regular part of your healthy eating routine!</p>
        `,
};

export const trendingItems = [
  {
    id: 2,
    title: "Intermittent Fasting: Is It Worth the Hype?",
    category: "Health",
    readTime: "1 min",
    image: "/products/prod_detail01.png",
  },
  {
    id: 3,
    title: "Body temperature and what it says about your health",
    category: "Health",
    readTime: "5 min",
    image: "/products/prod_detail01.png",
  },
  {
    id: 4,
    title: "The 4-7-8 breathing to fall asleep quickly",
    category: "Lifestyle",
    readTime: "8 min",
    image: "/products/prod_detail01.png",
  },
  {
    id: 5,
    title: "Losing weight by drinking water: does it really help you dry?",
    category: "Health",
    readTime: "10 min",
    image: "/products/prod_detail01.png",
  },
];

export const dummyBlog = {
  id: 1,
  image: "/wellness01.jpg",
  author: "Power supply",
  date: "May 8, 2024",
  title: "Are blueberries healthy? Here are the 6 benefits!",
  description:
    "Menopause: a notorious period. We explain the different phases of menopause and what you can expect.",
};
