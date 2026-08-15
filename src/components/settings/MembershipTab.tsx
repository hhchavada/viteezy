"use client";

import React, { useState } from "react";
import { useGetUserMembershipsQuery } from "@/store/api/membershipApi";
import { UserMembership } from "@/store/api/types/membership.types";
import Spinner from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

const MembershipTab = () => {
    const translate = useTranslations("Membership");
    const tAccount = useTranslations("Account");
    const [page, setPage] = useState(1);
    const limit = 10;
    
    const { data: membershipsData, isLoading, error, isFetching } = useGetUserMembershipsQuery({ page, limit });
    
    const memberships = membershipsData?.data || [];
    const pagination = membershipsData?.pagination;
    
    const handleLoadMore = () => {
        if (pagination?.hasNext && !isFetching) {
            setPage(prev => prev + 1);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && pagination && newPage <= pagination.pages && !isFetching) {
            setPage(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (pagination?.hasPrev && !isFetching) {
            setPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (pagination?.hasNext && !isFetching) {
            setPage(prev => prev + 1);
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };
    
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-light-mint text-aqua-deep';
            case 'cancelled':
                return 'bg-pastel-pink text-paprika';
            case 'expired':
                return 'bg-gray-100 text-gray-600';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const localizePlanLabel = (label?: string) => {
        if (!label) return "";
        return label
            .replace(/monthly/gi, tAccount("periodMonthly"))
            .replace(/yearly/gi, tAccount("periodYearly"))
            .replace(/weekly/gi, tAccount("periodWeekly"))
            .replace(/daily/gi, tAccount("periodDaily"));
    };

    const localizeStatusLabel = (status?: string) => {
        if (!status) return "";
        const normalized = status.toLowerCase();
        if (normalized === "active") return tAccount("subscriptionStatusActive");
        if (normalized === "cancelled") return tAccount("subscriptionStatusCancelled");
        if (normalized === "paused") return tAccount("subscriptionStatusPaused");
        return status;
    };

    if (isLoading && memberships.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spinner />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{translate("Failed to load memberships")}</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold ">{translate("membership")}</h2>

            {memberships.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">{translate("No memberships found")}</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {memberships.map((membership: UserMembership) => (
                            <div
                                key={membership.id}
                                className="border border-gray-100 rounded-2xl overflow-hidden "
                            >
                                {/* Header */}
                                <div className="px-6 py-4 flex items-center gap-4 bg-soft-slate border-b border-gray-100">
                                    <span
                                        className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(membership.status)}`}
                                    >
                                        {localizeStatusLabel(membership.status)}
                                    </span>
                                    <span className="font-medium ">{localizePlanLabel(membership.planLabel)}</span>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                            {translate("Start Date")}
                                        </p>
                                        <p className="text-sm font-medium ">{formatDate(membership.startDate)}</p>
                                    </div>

                                    {membership.status === "Active" ? (
                                        <>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Next Billing")}
                                                </p>
                                                <p className="text-sm font-medium ">{formatDate(membership.nextBillingDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Amount")}
                                                </p>
                                                <p className="text-sm font-medium ">{membership.amountDisplay}</p>
                                            </div>
                                        </>
                                    ) : membership.status === "Cancelled" ? (
                                        <>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Cancel Date")}
                                                </p>
                                                <p className="text-sm font-medium ">{membership.cancelDate ? formatDate(membership.cancelDate) : "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Amount")}
                                                </p>
                                                <p className="text-sm font-medium ">{membership.amountDisplay}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Expiry Date")}
                                                </p>
                                                <p className="text-sm font-medium ">{membership.expiryDate ? formatDate(membership.expiryDate) : "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slightly-gray font-medium mb-1">
                                                    {translate("Amount")}
                                                </p>
                                                <p className="text-sm font-medium ">{membership.amountDisplay}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {membership.pauseReason && (
                                    <div className="px-6 pb-6 mt-[-1rem]">
                                        <p className="text-xs uppercase tracking-wider text-slightly-gray font-semibold mb-1">
                                            {translate("Reason")}
                                        </p>
                                        <p className="text-sm font-medium ">{membership.pauseReason}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex flex-col items-center gap-4 pt-6">
                            {/* Page Numbers and Navigation */}
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={!pagination.hasPrev || isFetching}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {translate("Previous")}
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={isFetching}
                                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                    pageNum === page
                                                        ? "bg-teal-green-color text-white"
                                                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNext || isFetching}
                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {translate("Next")}
                                </button>
                            </div>

                            {/* Load More Option */}
                            {pagination.hasNext && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="text-sm text-gray-500">
                                        {translate("Page {current} of {total}", {
                                            current: pagination.page,
                                            total: pagination.pages
                                        })}
                                    </div>
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isFetching}
                                        className="px-6 py-2 bg-teal-green-color text-white rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isFetching ? (
                                            <>
                                                <Spinner className="w-4 h-4" />
                                                {translate("loading")}
                                            </>
                                        ) : (
                                            translate("Load More")
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Results Info */}
                            <div className="text-center text-sm text-gray-500">
                                {translate("Showing {count} of {total} memberships", {
                                    count: memberships.length,
                                    total: pagination.total
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Simple pagination info for single page */}
                    {pagination && pagination.pages <= 1 && (
                        <div className="text-center text-sm text-gray-500 pt-4">
                            {translate("Showing {count} of {total} memberships", {
                                count: memberships.length,
                                total: pagination.total
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MembershipTab;
