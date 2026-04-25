import React from 'react';
import TeacherLayout from '@/Components/TeacherLayout';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';

export default function TeacherCourses({ auth, courses }) {
    return (
        <TeacherLayout user={auth.user} title="My Courses">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600">Total Courses: {courses.length}</p>
                    </div>
                    <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-600"
                    >
                        Course creation by admin
                    </button>
                </div>

                {/* Courses Grid */}
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
                        message="You don't have any courses assigned yet. Please contact an administrator."
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                            </svg>
                        )}
                    />
                )}
            </div>
        </TeacherLayout>
    );
}
