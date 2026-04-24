import React from 'react';
import AdminLayout from '@/Components/AdminLayout';
import StatCard from '@/Components/StatCard';
import { PrimaryButton } from '@/Components/index';

export default function AdminDashboard({ auth, stats }) {
    return (
        <AdminLayout user={auth.user} title="Admin Dashboard">
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        label="Total Users"
                        value={stats.total_users}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-22 0v2h2v-2z" />
                            </svg>
                        )}
                        variant="blue"
                    />
                    <StatCard
                        label="Teachers"
                        value={stats.total_teachers}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        )}
                        variant="green"
                    />
                    <StatCard
                        label="Students"
                        value={stats.total_students}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        variant="indigo"
                    />
                    <StatCard
                        label="Courses"
                        value={stats.total_courses}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                            </svg>
                        )}
                        variant="purple"
                    />
                    <StatCard
                        label="Total Attendance"
                        value={stats.total_attendance}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        variant="green"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <a href="/admin/users" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            Manage Users
                        </a>
                        <a href="/admin/courses" className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                            Manage Courses
                        </a>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            View Analytics
                        </button>
                    </div>
                </div>

                {/* System Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overview Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">System Overview</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Student to Teacher Ratio</span>
                                <span className="font-bold text-gray-900">{stats.total_teachers > 0 ? Math.round(stats.total_students / stats.total_teachers) : 0}:1</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Average Course Size</span>
                                <span className="font-bold text-gray-900">{stats.total_courses > 0 ? Math.round(stats.total_students / stats.total_courses) : 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">System Status</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Operational</span>
                            </div>
                        </div>
                    </div>

                    {/* Support Information */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Welcome to Admin Panel</h2>
                        <p className="text-gray-700 mb-4">
                            Manage users, courses, and attendance records for the entire system. Use the navigation menu to access different sections.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>✓ View all users in the system</li>
                            <li>✓ Manage courses and assignments</li>
                            <li>✓ Monitor attendance trends</li>
                            <li>✓ Generate system reports</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
