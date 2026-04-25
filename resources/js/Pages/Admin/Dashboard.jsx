import React from 'react';
import AdminLayout from '@/Components/AdminLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import PrimaryButton from '@/Components/PrimaryButton';
import { UsersIcon, BookOpenIcon, CheckCircleIcon, AcademicCapIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard({ auth, stats }) {
    return (
        <AdminLayout user={auth.user} title="Dashboard">
            <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        label="Total Users"
                        value={stats.total_users}
                        Icon={UsersIcon}
                        variant="blue"
                    />
                    <StatCard
                        label="Teachers"
                        value={stats.total_teachers}
                        Icon={AcademicCapIcon}
                        variant="purple"
                    />
                    <StatCard
                        label="Students"
                        value={stats.total_students}
                        Icon={BookOpenIcon}
                        variant="amber"
                    />
                    <StatCard
                        label="Courses"
                        value={stats.total_courses}
                        Icon={BookOpenIcon}
                        variant="blue"
                    />
                    <StatCard
                        label="Attendance Records"
                        value={stats.total_attendance}
                        Icon={CheckCircleIcon}
                        variant="green"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card className="lg:col-span-2" variant="elevated">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></span>
                                Quick Actions
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="/admin/users"
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">Manage Users</p>
                                    <p className="text-sm text-gray-600">Edit roles and permissions</p>
                                </div>
                                <UsersIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="/admin/courses"
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group border border-green-200"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">Manage Courses</p>
                                    <p className="text-sm text-gray-600">Add or edit courses</p>
                                </div>
                                <BookOpenIcon className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                            </a>
                            <button className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group border border-purple-200">
                                <div>
                                    <p className="font-semibold text-gray-900">Analytics</p>
                                    <p className="text-sm text-gray-600">View reports</p>
                                </div>
                                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </Card>

                    {/* System Status */}
                    <Card variant="gradient">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">System Status</h2>
                                <p className="text-sm text-gray-600 mt-1">All systems operational</p>
                            </div>
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-t border-blue-200">
                                <span className="text-sm text-gray-700">Database</span>
                                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-t border-blue-200">
                                <span className="text-sm text-gray-700">API Service</span>
                                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full">Running</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-t border-blue-200">
                                <span className="text-sm text-gray-700">QR Service</span>
                                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* System Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card variant="elevated">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></span>
                            System Overview
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600 font-medium">Student to Teacher Ratio</span>
                                <span className="text-2xl font-bold text-blue-600">{stats.total_teachers > 0 ? Math.round(stats.total_students / stats.total_teachers) : 0}:1</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600 font-medium">Average Course Size</span>
                                <span className="text-2xl font-bold text-green-600">{stats.total_courses > 0 ? Math.round(stats.total_students / stats.total_courses) : 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600 font-medium">System Status</span>
                                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    Operational
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card variant="elevated">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></span>
                            Getting Started
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Manage Users</p>
                                    <p className="text-sm text-gray-600">Add and manage system users</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Create Courses</p>
                                    <p className="text-sm text-gray-600">Set up courses for teachers and students</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">✓</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Track Attendance</p>
                                    <p className="text-sm text-gray-600">Monitor attendance records</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
