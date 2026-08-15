interface MembershipBadgeProps {
  text: string;
}

export default function MembershipBadge({ text }: MembershipBadgeProps) {
  return (
    <span className="rounded-xs bg-[#EDDFA5] px-2 py-1 font-saans text-[12px] font-medium leading-tight text-black-color ">
      {text}
    </span>
  );
}
