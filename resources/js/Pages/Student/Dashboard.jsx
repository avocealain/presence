import React from 'react';
import StudentLayout from '@/Components/StudentLayout';
import StatCard from '@/Components/StatCard';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';

export default function StudentDashboard({ auth, enrollments, stats }) {
    return (
        <StudentLayout user={auth.user} title="Student Dashboard">
            <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}! 👋</h2>
                    <p className="text-gray-700">Here's an overview of your courses and attendance.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Enrolled Courses"
                        value={stats.enrolled_courses}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                            </svg>
                        )}
                        variant="blue"
                    />
                    <StatCard
                        label="Overall Attendance"
                        value={`${stats.overall_attendance_rate || 0}%`}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        variant="green"
                    />
                    <StatCard
                        label="Attended Sessions"
                        value={`${stats.total_attended}/${stats.total_sessions}`}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                        variant="indigo"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <a href="/student/scanner" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            📱 Scan Attendance
                        </a>
                        <a href="/student/attendance-history" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            📋 View History
                        </a>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>

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
                            icon={(props) => (
                                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                                </svg>
                            )}
                        />
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
