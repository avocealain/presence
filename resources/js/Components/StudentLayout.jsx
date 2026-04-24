import React, { useState } from 'react';
import AuthenticatedLayout from './AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function StudentLayout({ user, children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const studentNav = [
        { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
        { label: 'Courses', href: '/student/courses', icon: '📚' },
        { label: 'Scanner', href: '/student/scanner', icon: '📱' },
        { label: 'Attendance History', href: '/student/attendance-history', icon: '📋' },
    ];

    return (
        <AuthenticatedLayout user={user}>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile menu button */}
                <div className="lg:hidden fixed top-20 left-4 z-40">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Sidebar */}
                <div className={`fixed left-0 top-16 w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <nav className="p-6 space-y-2">
                        {studentNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:ml-64 pt-6">
                    {/* Header */}
                    {title && (
                        <div className="px-4 lg:px-8 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-4 lg:px-8 pb-8">
                        {children}
                    </div>
                </div>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
