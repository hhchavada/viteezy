import Image from "next/image";
import React, { memo } from "react";
import { TeamMember } from "@/store/api/types/team.types";
import FallbackImage from "../ui/fallbackImage";

interface TeamMemberProps {
  data: TeamMember;
  onClick: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ data, onClick }) => {
  const image = data?.image;
  const name = data?.name;
  const designation = data?.designation;

  return (
    <div
      onClick={() => onClick(data)}
      className="rounded-2xl overflow-hidden hover:-translate-y-3 transition-transform duration-500 cursor-pointer relative"
    >
      <FallbackImage
        alt={name || "Team member"}
        width={365}
        height={512}
        src={image}
        className="w-full h-full aspect-3/4 object-cover bg-gray-50"
      />
      <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1 pointer-events-none">
        {name && (
          <div className="inline-block max-w-full">
            <span className="inline-block max-w-full truncate text-sm font-medium text-white bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
              {name}
            </span>
          </div>
        )}

        {designation && (
          <div className="inline-block max-w-full">
            <span className="inline-block max-w-full truncate text-sm font-medium text-white bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
              {designation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TeamMemberCard);
