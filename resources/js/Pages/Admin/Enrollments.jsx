import React, { useMemo } from 'react';
import AdminLayout from '@/Components/AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';

export default function AdminEnrollments({ auth, enrollments, students = [], courses = [] }) {
    const flash = usePage().props.flash || {};

    const { data, setData, post, processing, errors } = useForm({
        student_id: students?.[0]?.id || '',
        course_id: courses?.[0]?.id || '',
    });

    const selectedCourse = useMemo(
        () => courses.find((course) => String(course.id) === String(data.course_id)),
        [courses, data.course_id],
    );

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.enrollments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData('student_id', students?.[0]?.id || '');
                setData('course_id', courses?.[0]?.id || '');
            },
        });
    };

    const updateEnrollmentStatus = (enrollmentId, status) => {
        router.patch(
            route('admin.enrollments.status', enrollmentId),
            { status },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout user={auth.user} title="Enrollment Management">
            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
                        {flash.success}
                    </div>
                )}

                {flash.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                        {flash.error}
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Assign Student to Course</h3>

                    {students.length === 0 || courses.length === 0 ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            Enrollment requires at least one active student and one course.
                        </p>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Student</label>
                                    <select
                                        value={data.student_id}
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.student_id && <p className="mt-1 text-xs text-red-600">{errors.student_id}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Course</label>
                                    <select
                                        value={data.course_id}
                                        onChange={(e) => setData('course_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && <p className="mt-1 text-xs text-red-600">{errors.course_id}</p>}
                                </div>
                            </div>

                            {selectedCourse && (
                                <p className="text-sm text-gray-600">
                                    Capacity: {selectedCourse.active_enrollments_count}/{selectedCourse.max_students}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                            >
                                {processing ? 'Assigning...' : 'Assign Course'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">Current Enrollments</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Enrolled At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {enrollments.data.length > 0 ? (
                                    enrollments.data.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{enrollment.student?.name || 'Unknown Student'}</div>
                                                <div className="text-xs text-gray-600">{enrollment.student?.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{enrollment.course?.code || '-'}</div>
                                                <div className="text-xs text-gray-600">{enrollment.course?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                        enrollment.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {enrollment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{enrollment.enrolled_at || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    {enrollment.status === 'active' ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateEnrollmentStatus(enrollment.id, 'dropped')}
                                                                className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                                                            >
                                                                Drop
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateEnrollmentStatus(enrollment.id, 'completed')}
                                                                className="rounded-lg border border-blue-300 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateEnrollmentStatus(enrollment.id, 'active')}
                                                            className="rounded-lg border border-green-300 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
                                                        >
                                                            Reactivate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No enrollments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {enrollments.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Page {enrollments.current_page} of {enrollments.last_page}</span>
                        <div className="flex gap-2">
                            {enrollments.prev_page_url ? (
                                <Link href={enrollments.prev_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
                                    Previous
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1 text-gray-400">Previous</span>
                            )}

                            {enrollments.next_page_url ? (
                                <Link href={enrollments.next_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
                                    Next
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1 text-gray-400">Next</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
