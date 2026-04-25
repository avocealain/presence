import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import StudentLayout from '@/Components/StudentLayout';

export default function AttendanceHistory({ auth, records, summary, pagination }) {
    const [filterCourse, setFilterCourse] = useState('all');
    const safeRecords = records || [];
    const safeSummary = summary || { total_records: 0, present_count: 0, attendance_rate: 0 };

    const courses = useMemo(() => [...new Set(safeRecords.map((r) => r.course_code))], [safeRecords]);
    const filteredRecords = filterCourse === 'all'
        ? safeRecords
        : safeRecords.filter((r) => r.course_code === filterCourse);

    return (
        <StudentLayout user={auth.user} title="Attendance History">
            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Filter by Course</label>
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Courses</option>
                                {courses.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-600">Recorded Sessions</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{safeSummary.total_records}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-600">Present</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">{safeSummary.present_count}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                        <p className="text-sm text-gray-600">Attendance Rate</p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">{safeSummary.attendance_rate}%</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Device Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="transition-colors hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.marked_at}</p>
                                                    <p className="mt-1 text-xs text-gray-600">{record.hours_ago}h ago</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.course_name}</p>
                                                    <p className="text-xs text-gray-600">{record.course_code}</p>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    {record.status || 'Present'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    <p>{record.device}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{record.ip_address}</p>
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

                {pagination?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Page {pagination.current_page} of {pagination.last_page}</p>
                        <div className="flex gap-2">
                            {pagination.prev_page_url ? (
                                <Link
                                    href={pagination.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-gray-400">Previous</span>
                            )}

                            {pagination.next_page_url ? (
                                <Link
                                    href={pagination.next_page_url}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-gray-400">Next</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <h3 className="mb-3 font-bold text-gray-900">About this history</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>Each row is a successful QR attendance record.</li>
                        <li>Device information helps detect suspicious behavior.</li>
                        <li>For absence analytics, planned class-session modeling is required.</li>
                    </ul>
                </div>
            </div>
        </StudentLayout>
    );
}

