import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import {
    Bars3Icon,
    XMarkIcon,
    ChartBarIcon,
    UsersIcon,
    BookOpenIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function AdminLayout({ user, children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const adminNav = [
        { label: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
        { label: 'Users', href: '/admin/users', icon: UsersIcon },
        { label: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
        { label: 'Enrollments', href: '/admin/enrollments', icon: UserPlusIcon },
    ];

    return (
        <AuthenticatedLayout user={user}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Mobile menu button */}
                <div className="lg:hidden fixed top-20 left-4 z-40">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="w-6 h-6" />
                        ) : (
                            <Bars3Icon className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Sidebar */}
                <div className={`fixed left-0 top-16 w-72 h-screen bg-white border-r border-gray-100 overflow-y-auto transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-lg lg:shadow-none`}>
                    <nav className="p-6 space-y-2">
                        {/* Brand/Logo section */}
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4">Administration</h3>
                        </div>

                        {adminNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 group"
                                >
                                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:ml-72 pt-6">
                    {/* Header */}
                    {title && (
                        <div className="px-4 lg:px-8 mb-10">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{title}</h1>
                            <p className="text-gray-500 text-sm mt-2">Manage your system efficiently</p>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-4 lg:px-8 pb-12">
                        {children}
                    </div>
                </div>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 lg:hidden z-30 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
