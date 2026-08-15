"use client";

import Image from "next/image";
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

type Props = {
    title: string;
    trigger: React.ReactNode;
    modelImages?: string[];
    initialIndex?: number;
};

export const ReadMoreDialog: React.FC<Props> = ({
    title,
    trigger,
    modelImages,
    initialIndex = 0,
}) => {
    const [mainApi, setMainApi] = React.useState<CarouselApi | null>(null);
    const [activeIndex, setActiveIndex] = React.useState(initialIndex);
    const thumbsRef = React.useRef<HTMLDivElement | null>(null);
    const dragState = React.useRef({ isDown: false, startX: 0, scrollLeft: 0 });
    const dragMovedRef = React.useRef(false);
    const [dragging, setDragging] = React.useState(false);

    React.useEffect(() => {
        if (!mainApi) return;
        const onSelect = () => setActiveIndex(mainApi.selectedScrollSnap());
        mainApi.on("select", onSelect);
        setActiveIndex(mainApi.selectedScrollSnap());
        // Scroll to initial index when carousel is ready
        if (initialIndex > 0) {
            mainApi.scrollTo(initialIndex, true);
        }
        return () => {
            mainApi.off("select", onSelect);
        };
    }, [mainApi, initialIndex]);

    const centerActiveThumb = React.useCallback(() => {
        const container = thumbsRef.current;
        if (!container) return;
        const activeEl = container.querySelector(
            `[data-index="${activeIndex}"]`
        ) as HTMLElement | null;
        if (!activeEl) return;
        const targetLeft =
            activeEl.offsetLeft -
            container.clientWidth / 2 +
            activeEl.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    }, [activeIndex]);

    React.useEffect(() => {
        centerActiveThumb();
    }, [centerActiveThumb]);

    const onThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = thumbsRef.current;
        if (!el) return;
        dragState.current.isDown = true;
        dragState.current.startX = e.clientX;
        dragState.current.scrollLeft = el.scrollLeft;
        dragMovedRef.current = false;
        setDragging(true);
        el.classList.add("dragging");
        try {
            (e.target as Element)?.setPointerCapture?.(e.pointerId);
        } catch { }
    };

    const onThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = thumbsRef.current;
        if (!el || !dragState.current.isDown) return;
        const dx = e.clientX - dragState.current.startX;
        if (Math.abs(dx) > 3) dragMovedRef.current = true;
        el.scrollLeft = dragState.current.scrollLeft - dx;
    };

    const endDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
        if (!dragState.current.isDown) return;
        dragState.current.isDown = false;
        setDragging(false);
        thumbsRef.current?.classList.remove("dragging");
        try {
            if (e) (e.target as Element)?.releasePointerCapture?.(e.pointerId);
        } catch { }
    };

    const handleThumbClick = (index: number) => {
        if (dragMovedRef.current) return;
        mainApi?.scrollTo(index);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-w-7xl bg-transparent border-none shadow-none  max-h-screen rounded-2xl overflow-hidden p-0 ">
                <style jsx>{`
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .dragging {
            cursor: grabbing !important;
          }
          .dragging * {
            pointer-events: none !important;
          }
        `}</style>

                {/* Main Carousel */}
                <div className="w-full flex justify-center">
                    <div className="relative w-full max-w-lg">
                        <Carousel
                            className="w-full"
                            opts={{
                                align: "center",
                                loop: true,
                            }}
                            setApi={setMainApi}
                        >
                            <CarouselContent className="-ml-4">
                                {Array.isArray(modelImages) &&
                                    modelImages.map(
                                        (image, index) =>
                                            image && (
                                                <CarouselItem key={index} className="pl-4">
                                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                                                        {/* Blurred background image */}
                                                        <Image
                                                            src={image}
                                                            alt=""
                                                            fill
                                                            className="object-cover blur-md opacity-50 scale-110"
                                                            sizes="(max-width: 768px) 100vw, 500px"
                                                            // unoptimized
                                                        />
                                                        {/* Main image */}
                                                        <Image
                                                            src={image}
                                                            alt={`${title} - Image ${index + 1}`}
                                                            fill
                                                            className="object-contain relative z-10"
                                                            sizes="(max-width: 768px) 100vw, 500px"
                                                            priority={index === 0}
                                                            // unoptimized
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            )
                                    )}
                            </CarouselContent>

                        </Carousel>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="w-full flex justify-center">
                    <div className="w-full max-w-lg">
                        <div
                            className={`mt-3 overflow-x-auto no-scrollbar ${dragging ? "dragging" : ""
                                }`}
                            ref={thumbsRef}
                            onPointerDown={onThumbPointerDown}
                            onPointerMove={onThumbPointerMove}
                            onPointerUp={endDrag}
                            onPointerLeave={endDrag}
                        >
                            <div className="flex items-center justify-center gap-3 min-w-max cursor-grab">
                                {Array.isArray(modelImages) &&
                                    modelImages.map(
                                        (thumb, index) =>
                                            thumb && (
                                                <button
                                                    type="button"
                                                    key={index}
                                                    data-index={index}
                                                    onClick={() => handleThumbClick(index)}
                                                    className={`relative w-14 h-14 shrink-0 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                >
                                                    <Image
                                                        src={thumb}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="56px"
                                                        // unoptimized
                                                    />
                                                </button>
                                            )
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};