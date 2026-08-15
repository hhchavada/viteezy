"use client";

import { useState } from "react";
import { faqData } from "@/components/constants";

const Plus = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`size-7 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

export default function MembershipFaq() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (id: number) => {
    const next = new Set(openItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenItems(next);
  };

  return (
    <section className="pb-12 lg:pb-[100px] pt-0 flex flex-col items-center gap-10 lg:gap-[60px]">
      <div className="flex flex-col items-center gap-3 text-center max-w-[700px]">
        <h2 className="font-saans text-2xl lg:text-[28px] font-medium text-black-color">
          Frequently asked questions
        </h2>
        <p className="font-saans text-sm lg:text-base text-black-color">
          Find clear, simple answers to common questions and understand how
          Health Compass supports you.
        </p>
      </div>

      <div className="w-full max-w-[1120px] flex flex-col gap-4">
        {faqData.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div
              key={item.id}
              className="rounded-[15px] bg-off-white-color overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full min-h-14 px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-saans text-sm lg:text-base font-medium text-black-color">
                  {item.question}
                </span>
                <Plus isOpen={isOpen} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="px-5 pb-4 font-saans text-sm text-black-color/80 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
