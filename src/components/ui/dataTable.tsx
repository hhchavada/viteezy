"use client";

import React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
} from "@tanstack/react-table";

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterDropdownProps {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    showPagination?: boolean;
    pageSize?: number;
    title?: string;
    filters?: FilterOption[];
    activeFilter?: string;
    onFilterChange?: (value: string) => void;
    /** When set, shows a dropdown for filter selection instead of filter buttons */
    filterDropdown?: FilterDropdownProps;
    /** Custom message to show when no results are found */
    noResultsMessage?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = false,
    pageSize = 10,
    title,
    filters,
    activeFilter,
    onFilterChange,
    filterDropdown,
    noResultsMessage,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    });

    return (
        <div className="w-full">
            <div className="rounded-2xl border border-extra-light-gray overflow-hidden">
                {/* Title and Filters Header */}
                {(title || filters || filterDropdown) && (
                    <div className="px-4 md:px-6 py-3 3xl:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 bg-white border-b border-extra-light-gray">
                        {title && <h3 className="text-lg 3xl:text-[22px] font-medium text-gray-900">{title}</h3>}
                        {filterDropdown && (
                            <div className="w-full md:w-auto min-w-[160px]">
                                <select
                                    value={filterDropdown.value}
                                    onChange={(e) => filterDropdown.onChange(e.target.value)}
                                    className="min-w-full md:w-auto px-3 py-2 rounded-lg text-sm 3xl:text-base font-medium text-gray-700 bg-white border border-extra-light-gray focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                                >
                                    {filterDropdown.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {!filterDropdown && filters && onFilterChange && (
                            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto overflow-x-auto">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => onFilterChange(filter.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeFilter === filter.value
                                            ? "bg-teal-green-color text-white"
                                            : " text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* Table wrapper with horizontal scroll */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead className="bg-soft-slate border-b border-extra-light-gray">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-3 md:px-6 py-4 text-left text-sm 3xl:text-lg font-medium text-gray-900"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-3 md:px-6 py-2 3xl:py-4 text-sm 3xl:text-lg">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-3 md:px-6 py-12 text-center text-gray-500"
                                    >
                                        {noResultsMessage || "No results found."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPagination && table.getPageCount() > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-2 py-4">
                    <div className="flex-1 text-sm text-gray-700">
                        {table.getFilteredRowModel().rows.length} row(s) total
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-extra-light-gray rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-extra-light-gray rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
