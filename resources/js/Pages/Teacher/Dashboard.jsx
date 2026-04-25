import React from 'react';
import TeacherLayout from '@/Components/TeacherLayout';
import Card from '@/Components/Card';
import StatCard from '@/Components/StatCard';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';
import { BookOpenIcon, UserGroupIcon, CheckCircleIcon, SparklesIcon, QrCodeIcon } from '@heroicons/react/24/outline';

export default function TeacherDashboard({ auth, courses, stats }) {
    return (
        <TeacherLayout user={auth.user} title="Dashboard">
            <div className="space-y-10">
                {/* Welcome Card */}
                <Card variant="gradient" className="border border-green-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {auth.user.name}! 👋</h2>
                            <p className="text-gray-700">Here's a quick overview of your teaching activities today.</p>
                        </div>
                        <SparklesIcon className="w-12 h-12 text-green-400 flex-shrink-0" />
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total Courses"
                        value={stats.total_courses}
                        Icon={BookOpenIcon}
                        variant="blue"
                    />
                    <StatCard
                        label="Enrolled Students"
                        value={stats.total_students}
                        Icon={UserGroupIcon}
                        variant="purple"
                    />
                    <StatCard
                        label="Today's Attendance"
                        value={`${stats.today_attendance || 0}`}
                        Icon={CheckCircleIcon}
                        variant="green"
                    />
                </div>

                {/* Quick Actions */}
                <Card variant="elevated">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></span>
                            Quick Actions
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses && courses.length > 0 && (
                            <a
                                href={`/courses/${courses[0].id}/generate-qr`}
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all group border border-green-200"
                            >
                                <div>
                                    <p className="font-semibold text-gray-900">Generate QR Code</p>
                                    <p className="text-sm text-gray-600">For your first course</p>
                                </div>
                                <QrCodeIcon className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                            </a>
                        )}
                        <a
                            href="/teacher/courses"
                            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200"
                        >
                            <div>
                                <p className="font-semibold text-gray-900">View All Courses</p>
                                <p className="text-sm text-gray-600">Manage your courses</p>
                            </div>
                            <BookOpenIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </Card>

                {/* Courses Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <span className="w-1 h-8 bg-gradient-to-b from-green-600 to-green-400 rounded-full"></span>
                        Your Courses
                    </h2>

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
                            icon={BookOpenIcon}
                        />
                    )}
                </div>
            </div>
        </TeacherLayout>
    );
}
