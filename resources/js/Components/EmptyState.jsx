import React from 'react';
import Card from './Card';

export default function EmptyState({ icon: Icon, title, message, action = null }) {
    return (
        <Card className="py-16 text-center">
            <div className="flex justify-center mb-6">
                {Icon && (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-100">
                        <Icon className="w-10 h-10 text-blue-500" />
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                >
                    {action.label}
                </button>
            )}
        </Card>
    );
}
