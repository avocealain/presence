import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const dashboardHref = user?.role === 'admin'
        ? route('admin.dashboard')
        : user?.role === 'teacher'
            ? route('teacher.dashboard')
            : user?.role === 'student'
                ? route('student.dashboard')
                : route('dashboard');

    const navigationItems = [
        {
            name: 'Dashboard',
            href: dashboardHref,
            current: route().current('dashboard') || route().current(`${user?.role}.dashboard`),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                type="button"
                                className="inline-flex items-center rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 md:hidden"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        clipRule="evenodd"
                                        fillRule="evenodd"
                                        d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                                    />
                                </svg>
                            </button>
                            <Link href="/" className="ms-2 flex md:me-24">
                                <ApplicationLogo className="me-3 h-8 w-8 fill-current text-blue-600" />
                                <span className="self-center whitespace-nowrap text-2xl font-semibold text-gray-800">
                                    Attendance
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                        >
                                            {user.name}
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white pt-20 transition-transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                <div className="h-full overflow-y-auto px-3 pb-4">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <NavLink
                                    href={item.href}
                                    active={item.current}
                                    className="block rounded-lg px-4 py-2 text-gray-900 hover:bg-gray-100"
                                >
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <div className="md:ml-64">
                <div className="pt-16">
                    {header && (
                        <header className="bg-white shadow">
                            <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                />
            )}
        </div>
    );
}
