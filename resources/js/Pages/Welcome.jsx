import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const dashboardHref = auth.user
        ? auth.user.role === 'admin'
            ? route('admin.dashboard')
            : auth.user.role === 'teacher'
                ? route('teacher.dashboard')
                : route('student.dashboard')
        : route('dashboard');

    return (
        <>
            <Head title="Welcome - Smart Attendance System" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                {/* Navigation */}
                <nav className="bg-white shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Smart Attendance</span>
                            </div>
                            <div className="flex gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboardHref}
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            QR-Based Attendance System
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Modern, secure, and efficient attendance tracking using QR codes. Perfect for schools, universities, and training centers.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href={route('login')}
                                className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="#features"
                                className="px-8 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Smart Attendance?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                            <p className="text-gray-600">Mark attendance in seconds using QR codes. No more manual roll calls.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                            <p className="text-gray-600">Multi-layer validation prevents duplicate entries and ensures data integrity.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                            <p className="text-gray-600">Works seamlessly on any device. Scan QR codes with any smartphone.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                    1
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher Generates QR</h3>
                                <p className="text-gray-600">Teachers generate a unique QR code for each class session with a 30-second validity period.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                    2
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Students Scan QR</h3>
                                <p className="text-gray-600">Students use their smartphones to scan the QR code displayed by the teacher.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                                    3
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Recorded</h3>
                                <p className="text-gray-600">Attendance is instantly recorded with timestamp and device information for security.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* User Roles */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Built for Everyone</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Admin */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-8 border border-indigo-200">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin</h3>
                            <p className="text-gray-700">Manage users, courses, and view system analytics. Full control over the attendance system.</p>
                        </div>

                        {/* Teacher */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border border-green-200">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher</h3>
                            <p className="text-gray-700">Generate QR codes, view attendance records, and track student participation in courses.</p>
                        </div>

                        {/* Student */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student</h3>
                            <p className="text-gray-700">Scan QR codes to mark attendance and view your attendance history with analytics.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Attendance System?</h2>
                        <p className="text-xl text-blue-100 mb-8">Start tracking attendance with QR codes today.</p>
                        <Link
                            href={route('register')}
                            className="inline-block px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p>&copy; 2026 Smart Attendance System. All rights reserved.</p>
                            </div>
                            <div className="flex gap-6">
                                <Link href={route('privacy')} className="hover:text-white transition">Privacy</Link>
                                <Link href={route('terms')} className="hover:text-white transition">Terms</Link>
                                <Link href={route('support')} className="hover:text-white transition">Support</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
