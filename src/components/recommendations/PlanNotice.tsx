interface PlanNoticeProps {
  message: string;
}

export default function PlanNotice({ message }: PlanNoticeProps) {
  return (
    <div className="rounded-xl bg-[#F3F1EA] px-3.5 py-3.5 text-center sm:px-5 sm:py-5">
      <p className="font-saans text-xs leading-5 text-[#757575] sm:text-sm sm:leading-6">
        {message}
      </p>
    </div>
  );
}
