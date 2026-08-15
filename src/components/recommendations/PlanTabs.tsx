import { PlanTier } from "@/types/recommendations";

interface PlanTabsProps {
  activeTier: PlanTier;
  onChange: (tier: PlanTier) => void;
  essentialCount: number;
  advancedCount: number;
}

export default function PlanTabs({
  activeTier,
  onChange,
  essentialCount,
  advancedCount,
}: PlanTabsProps) {
  const tabs: { id: PlanTier; label: string; count: number }[] = [
    { id: "essential", label: "Essential", count: essentialCount },
    { id: "advanced", label: "Advanced", count: advancedCount },
  ];

  return (
    <div className="inline-flex rounded-full bg-[#F3F1EA] p-1">
      {tabs.map((tab) => {
        const isActive = activeTier === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-6 py-2.5 font-saans text-sm transition-colors cursor-pointer ${
              isActive
                ? "bg-white font-semibold text-black-color shadow-sm"
                : "font-medium text-black-color/80"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        );
      })}
    </div>
  );
}
