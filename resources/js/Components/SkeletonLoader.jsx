import React from 'react';

export default function SkeletonLoader() {
    return null; // Namespace for skeleton variants
}

SkeletonLoader.Card = function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
        </div>
    );
};

SkeletonLoader.StatCard = function SkeletonStatCard() {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
        </div>
    );
};

SkeletonLoader.Grid = function SkeletonGrid({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonLoader.StatCard key={i} />
            ))}
        </div>
    );
};

SkeletonLoader.TableRow = function SkeletonTableRow({ columns = 5 }) {
    return (
        <tr className="border-b">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
            ))}
        </tr>
    );
};

SkeletonLoader.Table = function SkeletonTable({ rows = 5, columns = 5 }) {
    return (
        <table className="w-full">
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <SkeletonLoader.TableRow key={i} columns={columns} />
                ))}
            </tbody>
        </table>
    );
};

SkeletonLoader.Text = function SkeletonText({ width = 'w-full', height = 'h-4' }) {
    return <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>;
};

SkeletonLoader.Avatar = function SkeletonAvatar() {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>;
};
