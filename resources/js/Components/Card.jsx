import React from 'react';

export default function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    onClick = null,
    noPadding = false
}) {
    const baseStyles = 'bg-white rounded-xl border border-gray-100 transition-all duration-200';

    const variantStyles = {
        default: 'shadow-sm hover:shadow-md',
        elevated: 'shadow-md hover:shadow-lg',
        flat: 'shadow-none hover:shadow-sm',
        gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md',
    };

    const padding = noPadding ? '' : 'p-6';
    const hoverClass = hover ? 'cursor-pointer' : '';
    const clickableClass = onClick ? 'hover:border-blue-200 cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${padding} ${hoverClass} ${clickableClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
