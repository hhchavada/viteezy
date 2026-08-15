"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  isActive?: boolean;
}

interface ViteezyTimelineProps {
  title: string;
  subtitle: string;
  entries: TimelineEntry[];
}

gsap.registerPlugin(ScrollTrigger);

const ViteezyTimeline: React.FC<ViteezyTimelineProps> = ({
  title,
  subtitle,
  entries,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const centerLineProgressRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobileLineProgressRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile/tablet view (use stacked layout below lg)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addToItemsRef = (
    el: HTMLDivElement | null,
    index: number,
    layout: "mobile" | "desktop"
  ) => {
    if (!el) return;
    const isDesktopLayout = layout === "desktop";
    if (isMobile ? isDesktopLayout : !isDesktopLayout) return;
    itemsRef.current[index] = el;
  };

  useGSAP(() => {
    if (!sectionRef.current || !timelineContainerRef.current) return;

    // Kill any existing ScrollTriggers to prevent conflicts
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Animate the center line progress (hidden behind cards)
    if (centerLineProgressRef.current) {
      gsap.set(centerLineProgressRef.current, { scaleY: 0, transformOrigin: "top" });
      
      ScrollTrigger.create({
        trigger: timelineContainerRef.current,
        start: "top 40%",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          if (centerLineProgressRef.current) {
            gsap.set(centerLineProgressRef.current, { 
              scaleY: self.progress,
              transformOrigin: "top" 
            });
          }
        },
      });
    }

    // Animate the mobile/tablet line progress (fills black on scroll)
    if (mobileLineProgressRef.current && mobileContainerRef.current) {
      gsap.set(mobileLineProgressRef.current, { scaleY: 0, transformOrigin: "top" });

      ScrollTrigger.create({
        trigger: mobileContainerRef.current,
        start: "top 60%",
        end: "bottom 80%",
        scrub: 1,
        onUpdate: (self) => {
          if (mobileLineProgressRef.current) {
            gsap.set(mobileLineProgressRef.current, {
              scaleY: self.progress,
              transformOrigin: "top",
            });
          }
        },
      });
    }

    // Animate timeline items
    itemsRef.current.forEach((item, index) => {
      if (!item) return;

      // Reset item position
      gsap.set(item, { 
        opacity: 0, 
        y: isMobile ? 20 : 40,
        scale: 0.95 
      });

      // Create individual timeline for each item
      const itemTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          end: "top 30%",
          scrub: 1,
          toggleActions: "play none none reverse",
        }
      });

      // Entry animation
      itemTimeline
        .to(item, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out"
        })
        .to(item, {
          duration: 0.5,
          ease: "none"
        }, "-=0.3");

      // Optional: Add a subtle pulse animation when active
      if (entries[index]?.isActive !== false) {
        const card = item.querySelector('.timeline-card');
        if (card) {
          itemTimeline.to(card, {
            // boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            duration: 0.5,
            ease: "power2.out"
          }, "-=0.5");
        }
      }
    });

    // Animate the dots on the timeline
    const dots = gsap.utils.toArray(".timeline-dot");
    dots.forEach((dot: any, index) => {
      ScrollTrigger.create({
        trigger: dot,
        start: "top 85%",
        end: "top 30%",
        onEnter: () => {
          gsap.to(dot, {
            scale: 1.2,
            duration: 0.5,
            ease: "back.out(1.7)"
          });
        },
        onLeaveBack: () => {
          gsap.to(dot, {
            scale: 1,
            duration: 0.3
          });
        }
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, entries]);

  return (
    <section ref={sectionRef} className="relative bg-off-white-color py-10 md:py-14">
      {/* Sticky header on large screens only */}
      <div
        ref={stickyHeaderRef}
        className="lg:sticky lg:top-0 z-50 bg-off-white-color pb-6 lg:pb-8 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black-color mb-3 md:mb-4 font-saans">
              {title}
            </h2>
            <p className="text-base md:text-lg text-charcol-color leading-relaxed font-saans">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={timelineContainerRef}
        className="relative pt-2 md:pt-4 px-4"
      >
        <div className="max-w-7xl mx-auto">
          {/* Desktop Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 z-0">
            <div className="absolute inset-0 bg-gray-300/30 rounded-full" />
            <div
              ref={centerLineProgressRef}
              className="absolute inset-0 bg-black-color rounded-full origin-top"
            />
          </div>

          {/* Cards Container */}
          <div ref={cardsContainerRef} className="relative z-10">
            {/* Mobile & Tablet Layout */}
            <div ref={mobileContainerRef} className="lg:hidden relative">
              {/* Continuous vertical track with animated black fill */}
              <div className="absolute left-2 -translate-x-1/2 top-2 bottom-2 w-0.5 z-0">
                <div className="absolute inset-0 bg-gray-300/40 rounded-full" />
                <div
                  ref={mobileLineProgressRef}
                  className="absolute inset-0 bg-black-color rounded-full origin-top"
                />
              </div>

              {entries.map((entry, index) => {
                const isActive = entry.isActive !== false;
                const textColor = isActive ? "text-black-color" : "text-gray-400";
                const dotColor = isActive ? "bg-black-color" : "bg-gray-400";
                const isLast = index === entries.length - 1;

                return (
                  <div
                    key={`mobile-${index}`}
                    ref={(el) => addToItemsRef(el, index, "mobile")}
                    className={`relative pl-8 sm:pl-10 ${isLast ? "" : "pb-10 md:pb-12"}`}
                  >
                    {/* Dot sits on the track (centered without translate so GSAP scale won't shift it) */}
                    <div
                      className={`timeline-dot absolute left-0 top-1.5 z-10 w-4 h-4 rounded-full ${dotColor} border-[3px] border-off-white-color transition-all duration-300`}
                    />

                    <div className="text-left">
                      <div className={`text-2xl font-semibold mb-3 ${textColor} font-saans`}>
                        {entry.date}
                      </div>
                      <div className="timeline-card bg-white rounded-xl p-5 sm:p-6 border border-gainsboro duration-300">
                        <h3 className="text-lg font-semibold mb-2 sm:mb-3 font-saans text-black-color">
                          {entry.title}
                        </h3>
                        <p className="text-base leading-relaxed font-saans text-black-color">
                          {entry.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-24">
              {entries.map((entry, index) => {
                const isActive = entry.isActive !== false;
                const textColor = isActive ? "text-black-color" : "text-gray-400";
                const dotColor = isActive ? "bg-black-color" : "bg-gray-400";
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={`desktop-${index}`}
                    ref={(el) => addToItemsRef(el, index, "desktop")}
                    className="relative"
                  >
                    <div className="grid grid-cols-2 gap-12 xl:gap-16 items-center">
                      {isEven ? (
                        <>
                          <div className="text-right pr-16 xl:pr-20">
                            <div className={`text-3xl lg:text-4xl font-semibold ${textColor} font-saans`}>
                              {entry.date}
                            </div>
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                            <div
                              className={`timeline-dot w-8 h-8 rounded-full ${dotColor} border-4 border-off-white-color transition-all duration-300`}
                            />
                          </div>

                          <div className="pl-16 xl:pl-20">
                            <div className="timeline-card bg-white rounded-xl p-6 lg:p-8 border border-gainsboro duration-300">
                              <h3 className="text-xl lg:text-2xl font-semibold mb-3 font-saans text-black-color">
                                {entry.title}
                              </h3>
                              <p className="text-base lg:text-lg leading-relaxed font-saans text-black-color">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="pr-16 xl:pr-20">
                            <div className="timeline-card bg-white rounded-xl p-6 lg:p-8 border border-gainsboro duration-300">
                              <h3 className="text-xl lg:text-2xl font-semibold mb-3 font-saans text-black-color">
                                {entry.title}
                              </h3>
                              <p className="text-base lg:text-lg leading-relaxed font-saans text-black-color">
                                {entry.description}
                              </p>
                            </div>
                          </div>

                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                            <div
                              className={`timeline-dot w-8 h-8 rounded-full ${dotColor} border-4 border-off-white-color transition-all duration-300`}
                            />
                          </div>

                          <div className="text-left pl-16 xl:pl-20">
                            <div className={`text-3xl lg:text-4xl font-semibold ${textColor} font-saans`}>
                              {entry.date}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ViteezyTimeline;