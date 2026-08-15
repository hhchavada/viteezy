// components/header/SubMenu.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { memo } from "react";

interface SubMenuItem {
  title: string;
  slug: string;
}

interface SubMenuProps {
  items: SubMenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

const SubMenu: React.FC<SubMenuProps> = ({ items, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 transition-all duration-500 top-full mt-6 w-56">
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-3 overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={item.slug.startsWith("/") ? item.slug : `/${item.slug}`}
            className="flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
            onClick={onClose}
          >
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default memo(SubMenu);
