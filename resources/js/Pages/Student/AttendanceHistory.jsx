import React, { useState } from 'react';
import StudentLayout from '@/Components/StudentLayout';

export default function AttendanceHistory({ auth, records, pagination }) {
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [filterCourse, setFilterCourse] = useState('all');

    const courses = [...new Set(records.map(r => r.course_code))];
    const filteredRecords = filterCourse === 'all'
        ? records
        : records.filter(r => r.course_code === filterCourse);

    const getStatusBadge = (status) => {
        if (status === 'Present') {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-red-100 text-red-800';
    };

    return (
        <StudentLayout user={auth.user} title="Attendance History">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Courses</option>
                                {courses.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-sm text-gray-600">Total Sessions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-sm text-gray-600">Present</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{records.filter(r => r.status === 'Present').length}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-sm text-gray-600">Absent</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{records.filter(r => r.status === 'Absent').length}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-sm text-gray-600">Attendance Rate</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {pagination.total > 0 ? Math.round((records.filter(r => r.status === 'Present').length / pagination.total) * 100) : 0}%
                        </p>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Device Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.marked_at}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{record.hours_ago}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.course_name}</p>
                                                    <p className="text-xs text-gray-600">{record.course_code}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    <p>{record.device}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{record.ip_address}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No attendance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Page {pagination.current_page} of {pagination.last_page}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.current_page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Help Card */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-3">📌 Understanding Your History</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ <strong>Present:</strong> You successfully scanned the QR code</li>
                        <li>✓ <strong>Device Info:</strong> Shows the device used to mark attendance</li>
                        <li>✓ <strong>Export:</strong> Download your attendance as CSV for records</li>
                        <li>✓ <strong>Attendance Rate:</strong> Percentage of sessions attended</li>
                    </ul>
                </div>
            </div>
        </StudentLayout>
    );
}
