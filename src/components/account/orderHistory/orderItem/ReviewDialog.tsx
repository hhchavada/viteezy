"use client";

import React, { useState, useRef } from "react";
import PortalDialog from "@/components/ui/portalDialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UploadRatingImageIcon } from "@/components/icons";
import { Edit } from "lucide-react";
import { useAddReviewMutation } from "@/store";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

interface ReviewDialogProps {
    isShow: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        description?: string;
        image: string;
    };
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
    isShow,
    onClose,
    product,
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>("");


    // Image upload logic commented out for future use
    /*
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    */

    const [addReview, { isLoading }] = useAddReviewMutation();
    const t = useTranslations("Account");
    const tCommon = useTranslations("Common");

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex);
    };

    const handleStarHover = (starIndex: number) => {
        setHoveredRating(starIndex);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    /*
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.size <= 3 * 1024 * 1024) {
            // 3MB limit
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            alert("File size must be less than 3MB");
        }
    };

    const handleClickUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.size <= 3 * 1024 * 1024) {
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            alert("File size must be less than 3MB");
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    */

    const handleSubmit = async () => {
        if (!rating) {
            toast.error(t("reviewRatingRequired"));
            return;
        }

        try {
            await addReview({
                productId: product.id,
                rating,
                content: reviewText
            }).unwrap();

            toast.success(t("reviewSubmitted"));

            // Reset form
            setRating(0);
            setReviewText("");
            /*
            setUploadedImage(null);
            setPreviewUrl("");
            */

            // Close dialog
            onClose();
        } catch (error: any) {
            console.error("Review submission failed:", error);
            toast.error(error?.data?.message || t("reviewSubmitFailed"));
        }
    };

    return (
        <PortalDialog
            isShow={isShow}
            onClose={onClose}
            width={450}
            showCloseButton={true}
            bodyClass="p-0 max-h-[90vh]"
            contentClass="mt-0 p-6"
            closeButtonClass="top-6 right-3 border border-light-gray hover:border-gray-300 cursor-pointer"
        >
            <div className="">
                {/* Header */}
                <h2 className="text-2xl 4xl:text-3xl font-medium text-gray-900 mb-4">
                    {t("reviewAddTitle")}
                </h2>

                {/* Product Info */}
                <div className="flex items-center gap-4 mb-6 ">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-sm text-gray-500">{product.description}</p>
                        )}
                    </div>
                </div>

                {/* Rating Section */}
                <div className="mb-4">
                    <h3 className="text-center text-base font-medium text-gray-900 mb-1">
                        {t("reviewHowWasProduct")}
                    </h3>
                    <div className="flex justify-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                            <button
                                key={starIndex}
                                type="button"
                                onClick={() => handleStarClick(starIndex)}
                                onMouseEnter={() => handleStarHover(starIndex)}
                                onMouseLeave={handleStarLeave}
                                className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                            >
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="transition-colors"
                                >
                                    <path
                                        d="M20 30.8333L9.44444 36.6667L11.5556 24.5833L2.77778 16.3333L15.1111 14.5833L20 3.33334L24.8889 14.5833L37.2222 16.3333L28.4444 24.5833L30.5556 36.6667L20 30.8333Z"
                                        fill={
                                            starIndex <= (hoveredRating || rating)
                                                ? "#1baf9a"
                                                : "#EBEBEB"
                                        }
                                        stroke={
                                            starIndex <= (hoveredRating || rating)
                                                ? "#1baf9a"
                                                : "#EBEBEB"
                                        }
                                        strokeWidth="1"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-dim-gray">
                        {t("reviewAnonymous")}
                    </p>
                </div>

                {/* Review Text Area */}
                <div className="mb-3">
                    <h3 className="text-base font-medium  mb-2">
                        {t("reviewWriteHeading")}
                    </h3>
                    <textarea
                        className="w-full min-h-[120px] p-4 bg-soft-slate rounded-lg border border-extra-light-gray focus:border-gray-300 focus:outline-none resize-none text-gray-900 placeholder:text-silver-gray text-sm"
                        placeholder={t("reviewCommentPlaceholder")}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </div>

                {/* Image Upload Section - Commented out for future use */}
                {/* 
                <div className="mb-4">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                        Share a photo
                    </h3>

                    <div
                        className="rounded-lg min-h-40 flex flex-col items-center justify-center cursor-pointer transition-colors relative w-full overflow-hidden"
                        style={
                            previewUrl
                                ? {
                                    backgroundImage: `url(${previewUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                }
                                : {
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect x='0.5' y='0.5' width='99%25' height='99%25' fill='none' stroke='%23EBEBEB' stroke-width='1' stroke-dasharray='8 14' rx='8' ry='8'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "100% 100%",
                                    backgroundColor: "#f9fafb",
                                }
                        }
                        onClick={handleClickUpload}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        {previewUrl ? (
                            <div className="relative w-full h-full min-h-40">
                                
                                <div
                                    className="absolute inset-0 backdrop-blur-md bg-black/10 
                                    rounded-lg "
                                    style={{
                                        backgroundImage: `url(${previewUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        filter: "blur(60px)",
                                        transform: "scale(1.1)",
                                        borderRadius: "12px",
                                    }}
                                />

                                
                                <div className="relative w-full h-full flex items-center justify-center z-10 ">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        width={200}
                                        height={200}
                                        className="object-contain h-40 rounded-lg "
                                    />
                                </div>

                                
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClickUpload();
                                    }}
                                    className="absolute top-3 right-3 z-20 bg-white/30 rounded-sm p-1 shadow-lg hover:bg-white/20 transition-colors flex items-center gap-2 cursor-pointer backdrop-blur-xl "
                                >
                                    <Edit size={16} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <UploadRatingImageIcon />
                                <p className="text-gray-600 text-sm mt-2">
                                    <span className="text-dim-gray underline">Click to upload</span> &nbsp;
                                    <span className="text-black">
                                        or drag and drop
                                    </span>
                                </p>
                                <p className="text-dim-gray text-xs">Max. File Size: 3MB</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
                */}

                {/* Submit Button */}
                <Button
                    className="w-full text-base h-12 rounded-xl"
                    size="elevate-md"
                    variant="elevate"
                    onClick={handleSubmit}
                    disabled={rating === 0 || isLoading}
                >
                    {isLoading ? tCommon("submitting") : tCommon("submit")}
                </Button>
            </div>
        </PortalDialog>
    );
};

export default ReviewDialog;
