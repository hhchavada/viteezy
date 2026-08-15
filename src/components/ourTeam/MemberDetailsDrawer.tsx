import React from "react";
import Backdrop from "../ui/backdrop";
import Image from "next/image";
import { X } from "../icons";
import { TeamMember } from "@/store/api/types/team.types";
import FallbackImage from "../ui/fallbackImage";
import FixedPortal from "@/components/ui/fixedPortal";
import { useTranslations } from "next-intl";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

const MemberDetailsDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const tCommon = useTranslations("Common");
  const tAbout = useTranslations("AboutUs");
  return (
    <FixedPortal>
      <Backdrop isOpen={isOpen} onClose={onClose} zIndex={40} />
      <div
        className={`fixed h-screen overflow-auto top-0 p-4.5 right-0 w-screen sm:w-140 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-end gap-4 relative mb-8">
          <button
            onClick={onClose}
            className="absolute top-0 left-0 flex h-11 w-11 items-center justify-center rounded-4xl bg-white text-black transition-all hover:text-white hover:bg-black/80 cursor-pointer duration-300"
            aria-label={tCommon("closeDrawerAria")}
          >
            <X className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-[35px] sm:text-[49px] font-medium leading-tight break-all line-clamp-2">
              {member?.name || tAbout("teamMemberFallback")}
            </h2>

            {member?.designation && (
              <p className="text-2xl sm:text-[28px] font-medium text-gray-400 break-all line-clamp-1 leading-tight">
                {member.designation}
              </p>
            )}
          </div>

          <div className="h-[207px] min-w-40 max-w-40">
            <FallbackImage
              className="h-full w-full object-cover rounded-[20px] bg-gray-200"
              alt={member?.name || tAbout("teamMemberFallback")}
              width={160}
              height={207}
              src={member?.image || ""}
            />
          </div>
        </div>

        {member?.content && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: member.content }}
          />
        )}
      </div>
    </FixedPortal>
  );
};

export default MemberDetailsDrawer;
