import React, { useState } from 'react';
import AdminLayout from '@/Components/AdminLayout';
import { Link } from '@inertiajs/react';

export default function AdminUsers({ auth, users }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Filter users based on search and role
    const filteredUsers = users.data.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'teacher':
                return 'bg-green-100 text-green-800';
            case 'student':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <AdminLayout user={auth.user} title="Users Management">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                disabled
                                className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-600"
                            >
                                User creation via seed/admin API
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.department || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.is_active)}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
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
                                            No users found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Info */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Page {users.current_page} of {users.last_page}</span>
                        <div className="flex gap-2">
                            {users.prev_page_url ? (
                                <Link href={users.prev_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
                                    Previous
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1 text-gray-400">Previous</span>
                            )}

                            {users.next_page_url ? (
                                <Link href={users.next_page_url} className="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50">
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
