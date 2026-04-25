import React from 'react';
import { Link } from '@inertiajs/react';
import TeacherLayout from '@/Components/TeacherLayout';
import Card from '@/Components/Card';
import EmptyState from '@/Components/EmptyState';
import {
    UsersIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function TeacherAttendance({ auth, course, attendance_summary, stats }) {
    const summary = attendance_summary || [];
    const courseStats = stats || {};

    return (
        <TeacherLayout user={auth.user} title={`Attendance - ${course?.code || ''}`}>
            <div className="space-y-6">
                <Card variant="elevated">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-green-600 uppercase">{course?.code}</p>
                            <h2 className="text-2xl font-bold text-gray-900">{course?.name}</h2>
                        </div>
                        <a
                            href={`/courses/${course?.id}/attendance/export`}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            Export CSV
                        </a>
                    </div>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="text-center">
                        <UsersIcon className="mx-auto mb-2 h-7 w-7 text-blue-600" />
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{courseStats.total_students ?? 0}</p>
                    </Card>
                    <Card className="text-center">
                        <CheckCircleIcon className="mx-auto mb-2 h-7 w-7 text-green-600" />
                        <p className="text-sm text-gray-600">Present Today</p>
                        <p className="text-2xl font-bold text-gray-900">{courseStats.present_today ?? 0}</p>
                    </Card>
                    <Card className="text-center">
                        <XCircleIcon className="mx-auto mb-2 h-7 w-7 text-red-600" />
                        <p className="text-sm text-gray-600">Absent Today</p>
                        <p className="text-2xl font-bold text-gray-900">{courseStats.absent_today ?? 0}</p>
                    </Card>
                    <Card className="text-center">
                        <p className="mb-2 text-sm text-gray-600">Attendance Rate</p>
                        <p className="text-2xl font-bold text-green-600">{courseStats.attendance_rate ?? 0}%</p>
                    </Card>
                </div>

                {summary.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title="No Attendance Data Yet"
                        message="No attendance has been recorded for this course yet."
                    />
                ) : (
                    <Card noPadding>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Attended</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Total Sessions</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {summary.map((row, idx) => (
                                        <tr key={`${row?.student?.id || 'student'}-${idx}`}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {row?.student?.name || 'Unknown'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                {row?.student?.email || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{row?.attended ?? 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{row?.total_sessions ?? 0}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-700">{row?.attendance_rate ?? 0}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                <div>
                    <Link
                        href="/teacher/courses"
                        className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Back to Courses
                    </Link>
                </div>
            </div>
        </TeacherLayout>
    );
}

