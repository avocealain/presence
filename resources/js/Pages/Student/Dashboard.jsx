import React from 'react';
import StudentLayout from '@/Components/StudentLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';
import { BookOpenIcon, CheckCircleIcon, CalendarIcon, SparklesIcon, QrCodeIcon, ClipboardIcon } from '@heroicons/react/24/outline';

export default function StudentDashboard({ auth, enrollments, stats }) {
    return (
        <StudentLayout user={auth.user} title="Dashboard">
            <div className="space-y-10">
                {/* Welcome Card */}
                <Card variant="gradient" className="border border-blue-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}!</h2>
                            <p className="text-gray-700">Here's an overview of your courses and attendance performance.</p>
                        </div>
                        <SparklesIcon className="w-12 h-12 text-blue-400 flex-shrink-0" />
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Enrolled Courses"
                        value={stats.enrolled_courses}
                        Icon={BookOpenIcon}
                        variant="blue"
                    />
                    <StatCard
                        label="Overall Attendance"
                        value={`${stats.overall_attendance_rate || 0}%`}
                        Icon={CheckCircleIcon}
                        variant="green"
                    />
                    <StatCard
                        label="Sessions Attended"
                        value={`${stats.total_attended}/${stats.total_sessions}`}
                        Icon={CalendarIcon}
                        variant="purple"
                    />
                </div>

                {/* Quick Actions */}
                <Card variant="elevated">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></span>
                            Quick Actions
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="/student/scanner"
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">Scan Attendance</p>
                                <p className="text-sm text-gray-600">Use camera to scan QR</p>
                            </div>
                            <QrCodeIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                        </a>
                        <a
                            href="/student/attendance-history"
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all group border border-purple-200"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">View History</p>
                                <p className="text-sm text-gray-600">Check attendance records</p>
                            </div>
                            <ClipboardIcon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </Card>

                {/* Enrolled Courses */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></span>
                        Your Courses
                    </h2>

                    {enrollments && enrollments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enrollment) => (
                                <CourseCard
                                    key={enrollment.id}
                                    course={{
                                        ...enrollment.course,
                                        attendance: enrollment.attendance,
                                        activeEnrollments: [],
                                    }}
                                    actions={[
                                        {
                                            label: 'View Details',
                                            href: `/student/courses`,
                                        },
                                        {
                                            label: 'Scan Now',
                                            href: `/student/scanner`,
                                        },
                                    ]}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No Courses Yet"
                            message="You haven't been enrolled in any courses. Contact your administrator if you think this is a mistake."
                            icon={BookOpenIcon}
                        />
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
