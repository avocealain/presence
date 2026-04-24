import React from 'react';

export default function EmptyState({ icon: Icon, title, message, action = null }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 py-12 px-6 text-center">
            <div className="flex justify-center mb-4">
                {Icon && (
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
