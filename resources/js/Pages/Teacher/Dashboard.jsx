import React from 'react';
import TeacherLayout from '@/Components/TeacherLayout';
import StatCard from '@/Components/StatCard';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';

export default function TeacherDashboard({ auth, courses, stats }) {
    return (
        <TeacherLayout user={auth.user} title="Teacher Dashboard">
            <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}! 👋</h2>
                    <p className="text-gray-700">Here's a quick overview of your teaching activities.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        label="Total Courses"
                        value={stats.total_courses}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                            </svg>
                        )}
                        variant="green"
                    />
                    <StatCard
                        label="Enrolled Students"
                        value={stats.total_students}
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-22 0v2h2v-2z" />
                            </svg>
                        )}
                        variant="blue"
                    />
                    <StatCard
                        label="Today's Attendance"
                        value={`${stats.today_attendance || 0}`}
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
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        {courses && courses.length > 0 && (
                            <a href={`/courses/${courses[0].id}/generate-qr`} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                                Generate QR Code
                            </a>
                        )}
                        <a href="/teacher/courses" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            View All Courses
                        </a>
                    </div>
                </div>

                {/* Courses Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>

                    {courses && courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    showTeacher={false}
                                    actions={[
                                        {
                                            label: 'Generate QR',
                                            href: `/courses/${course.id}/generate-qr`,
                                        },
                                        {
                                            label: 'Attendance',
                                            href: `/courses/${course.id}/attendance`,
                                        },
                                    ]}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No Courses Yet"
                            message="You haven't been assigned any courses. Contact your administrator if you think this is a mistake."
                            icon={(props) => (
                                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                                </svg>
                            )}
                        />
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
