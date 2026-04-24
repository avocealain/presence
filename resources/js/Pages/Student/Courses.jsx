import React from 'react';
import StudentLayout from '@/Components/StudentLayout';
import CourseCard from '@/Components/CourseCard';
import EmptyState from '@/Components/EmptyState';

export default function StudentCourses({ auth, courses }) {
    return (
        <StudentLayout user={auth.user} title="My Courses">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <p className="text-gray-600">Viewing {courses.length} enrolled course{courses.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Courses Grid */}
                {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                actions={[
                                    {
                                        label: 'Scan Now',
                                        href: '/student/scanner',
                                    },
                                    {
                                        label: 'History',
                                        href: '/student/attendance-history',
                                    },
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Courses Enrolled"
                        message="You are not enrolled in any courses. Contact your instructor or administrator."
                        icon={(props) => (
                            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.001c0 5.591 3.824 10.29 9 11.622m0-13c5.5 0 10 4.745 10 10.999 0 5.592-3.824 10.29-9 11.622" />
                            </svg>
                        )}
                    />
                )}

                {/* Information Card */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">📚 Course Information</h3>
                    <p className="text-gray-700 text-sm">
                        Your courses are listed above with your current attendance rate. To mark attendance, go to the Scanner and scan the QR code displayed by your instructor.
                    </p>
                </div>
            </div>
        </StudentLayout>
    );
}
