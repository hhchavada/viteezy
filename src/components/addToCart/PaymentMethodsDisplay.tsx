import Image from "next/image";

const paymentMethods = [
    { id: "paypal", src: "/products/paypal.png", alt: "PayPal" },
    { id: "visa", src: "/products/visa.png", alt: "Visa" },
    { id: "ideal", src: "/products/iDeal.png", alt: "iDeal" },
];

export default function PaymentMethodsDisplay() {
    return (
        <div className="pb-6">
            <div className="flex items-center justify-center gap-2">
                {paymentMethods.map((method) => (
                    <div
                        key={method.id}
                        className="bg-white border-2 border-linen-color p-1 py-2 w-10 justify-center flex"
                    >
                        <Image
                            src={method.src}
                            alt={method.alt}
                            width={320}
                            height={200}
                            className="h-2 w-auto"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
