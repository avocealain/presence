import React from 'react';

export default function StatCard({ icon: Icon, label, value, change, variant = 'blue', className = '' }) {
    const variantStyles = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        indigo: 'bg-indigo-50 border-indigo-200',
        purple: 'bg-purple-50 border-purple-200',
    };

    const labelColorStyles = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        indigo: 'text-indigo-600',
        purple: 'text-purple-600',
    };

    const changeColorStyle = change && change >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className={`${variantStyles[variant] || variantStyles.blue} border rounded-lg p-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <div className="mt-2 flex items-baseline justify-between">
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {change !== undefined && (
                            <span className={`text-sm font-semibold ${changeColorStyle}`}>
                                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                </div>
                {Icon && (
                    <div className={`${labelColorStyles[variant] || labelColorStyles.blue} p-3 rounded-lg bg-white`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
