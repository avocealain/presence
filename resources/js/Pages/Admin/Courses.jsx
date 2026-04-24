import React from 'react';
import AdminLayout from '@/Components/AdminLayout';

export default function AdminCourses({ auth, courses }) {
    return (
        <AdminLayout user={auth.user} title="Courses Management">
            <div className="space-y-6">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600">Total Courses: {courses.total}</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Add Course
                    </button>
                </div>

                {/* Courses Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Academic Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courses.data && courses.data.length > 0 ? (
                                    courses.data.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                                    {course.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{course.name}</div>
                                                <div className="text-sm text-gray-600">{course.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                {course.teacher ? course.teacher.name : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-gray-900">{course.enrollments_count || 0}</div>
                                                    <div className="text-xs text-gray-600">enrolled</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {course.academic_year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</button>
                                                    <button className="text-red-600 hover:text-red-900 font-medium text-sm">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No courses available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Info */}
                {courses.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Page {courses.current_page} of {courses.last_page}</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
