import React, { useState } from 'react';
import AdminLayout from '@/Components/AdminLayout';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function AdminCourses({ auth, courses, teachers }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const flash = usePage().props.flash || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: teachers?.[0]?.id || '',
        code: '',
        name: '',
        description: '',
        semester: '',
        academic_year: '',
        max_students: 50,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.courses.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('code', 'name', 'description', 'semester', 'academic_year');
                setData('max_students', 50);
                setData('teacher_id', teachers?.[0]?.id || '');
                setShowCreateForm(false);
            },
        });
    };

    return (
        <AdminLayout user={auth.user} title="Courses Management">
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

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600">Total Courses: {courses.total}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((prev) => !prev)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
                    >
                        {showCreateForm ? 'Cancel' : 'Add Course'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New Course</h3>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Teacher</label>
                                    <select
                                        value={data.teacher_id}
                                        onChange={(e) => setData('teacher_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {teachers?.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && <p className="mt-1 text-xs text-red-600">{errors.teacher_id}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Course Code</label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="CS101"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Course Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Introduction to Programming"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={data.semester}
                                        onChange={(e) => setData('semester', e.target.value)}
                                        placeholder="1"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.semester && <p className="mt-1 text-xs text-red-600">{errors.semester}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Academic Year</label>
                                    <input
                                        type="text"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="2026-2027"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.academic_year && <p className="mt-1 text-xs text-red-600">{errors.academic_year}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Max Students</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.max_students && <p className="mt-1 text-xs text-red-600">{errors.max_students}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="Optional course description..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? 'Creating...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Course Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Students</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Academic Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {courses.data && courses.data.length > 0 ? (
                                    courses.data.map((course) => (
                                        <tr key={course.id} className="transition-colors hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                                                    {course.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{course.name}</div>
                                                <div className="text-sm text-gray-600">{course.description}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                                                {course.teacher ? course.teacher.name : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {course.active_enrollments_count || 0}/{course.max_students || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        active ({course.total_enrollments_count || 0} total)
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-600">{course.academic_year}</td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex gap-2">
                                                    <span className="cursor-not-allowed text-sm font-medium text-gray-400">Edit</span>
                                                    <span className="cursor-not-allowed text-sm font-medium text-gray-400">Delete</span>
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

                {courses.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Page {courses.current_page} of {courses.last_page}</span>
                        <div className="flex gap-2">
                            {courses.prev_page_url ? (
                                <Link href={courses.prev_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
                                    Previous
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1 text-gray-400">Previous</span>
                            )}

                            {courses.next_page_url ? (
                                <Link href={courses.next_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
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

