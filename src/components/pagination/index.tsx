import { PaginationRightIcon } from "../icons";

// components/Pagination.tsx
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);

        if (currentPage > 3) pages.push("...");

        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            if (!pages.includes(i) && i !== totalPages) pages.push(i);
        }

        if (currentPage < totalPages - 2) pages.push("...");

        if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
        <div className="flex items-center gap-1 text-sm justify-center font-medium select-none">
            {/* Prev */}
            {currentPage > 1 && (
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex cursor-pointer items-center gap-1 text-black hover:text-gray-600 transition-colors duration-300"
                >
                    <span className="text-lg rotate-180 mr-0.5"><PaginationRightIcon/></span>
                    Prev
                </button>
            )}

            {pages.map((page, index) => {
                if (page === "...") {
                    return (
                        <span key={`ellipsis-${index}`} className="text-gray-500">
                            ...
                        </span>
                    );
                }

                const pageNumber = page as number;

                return (
                    <button
                        key={pageNumber}
                        onClick={() => onPageChange(pageNumber)}
                        className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors duration-300 cursor-pointer
              ${currentPage === pageNumber
                                ? "bg-black text-white"
                                : "text-black hover:bg-gray-200"
                            }`}
                    >
                        {pageNumber}
                    </button>
                );
            })}

            {/* Next */}
            {currentPage < totalPages && (
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex cursor-pointer items-center gap-1 text-black hover:text-gray-700 transition-colors duration-300"
                >
                    Next
                    <span className="text-lg ml-0.5"><PaginationRightIcon/></span>
                </button>
            )}
        </div>
    );
}
