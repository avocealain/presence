import React from 'react';
import { Link } from '@inertiajs/react';

export default function CourseCard({ course, showTeacher = true, actions = [] }) {
    const attendancePercentage = course.attendance?.attendance_rate || 0;
    const attendanceColor = attendancePercentage >= 75 ? 'bg-green-500' : attendancePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-indigo-600 uppercase">{course.code}</p>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{course.name}</h3>
                {showTeacher && course.teacher && (
                    <p className="text-sm text-gray-600 mt-1">👨‍🏫 {course.teacher}</p>
                )}
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {course.activeEnrollments !== undefined && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Students Enrolled</span>
                        <span className="font-semibold text-gray-900">{course.activeEnrollments?.length || 0}</span>
                    </div>
                )}
                {course.attendance !== undefined && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Attendance Rate</span>
                        <span className="font-semibold text-gray-900">{course.attendance.attendance_rate || 0}%</span>
                    </div>
                )}
            </div>

            {/* Attendance Progress Bar */}
            {course.attendance !== undefined && (
                <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${attendanceColor}`}
                            style={{ width: `${Math.min(course.attendance.attendance_rate || 0, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                {actions.map((action, index) => (
                    action.href ? (
                        <Link
                            key={index}
                            href={action.href}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                            {action.label}
                        </button>
                    )
                ))}
            </div>
        </div>
    );
}
