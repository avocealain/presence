import React from 'react';
import Card from './Card';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function StatCard({ Icon, label, value, change, variant = 'blue', className = '' }) {
    const variantStyles = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            icon: 'bg-blue-100',
            border: 'border-blue-100',
        },
        green: {
            bg: 'bg-green-50',
            text: 'text-green-600',
            icon: 'bg-green-100',
            border: 'border-green-100',
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            icon: 'bg-red-100',
            border: 'border-red-100',
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            icon: 'bg-purple-100',
            border: 'border-purple-100',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            icon: 'bg-amber-100',
            border: 'border-amber-100',
        },
    };

    const styles = variantStyles[variant] || variantStyles.blue;
    const isPositive = change === undefined || change >= 0;
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
        <Card className={`${styles.bg} ${styles.border} border ${className}`} variant="elevated">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                    <div className="mt-3 flex items-baseline justify-between">
                        <p className="text-4xl font-bold text-gray-900">{value}</p>
                        {change !== undefined && (
                            <div className={`flex items-center gap-1 text-sm font-semibold ${changeColor}`}>
                                {isPositive ? (
                                    <ArrowUpIcon className="w-4 h-4" />
                                ) : (
                                    <ArrowDownIcon className="w-4 h-4" />
                                )}
                                {Math.abs(change)}%
                            </div>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className={`${styles.icon} p-3 rounded-xl flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${styles.text}`} />
                    </div>
                )}
            </div>
        </Card>
    );
}
