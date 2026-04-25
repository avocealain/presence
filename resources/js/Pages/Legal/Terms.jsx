import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service - Smart Attendance System" />
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            Back to Home
                        </Link>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">1. Scope</h2>
                            <p>
                                These terms govern the use of Smart Attendance System by institution administrators, teachers,
                                and students for attendance management.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">2. Account Use</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Users must keep login credentials confidential.</li>
                                <li>Users are responsible for actions performed under their account.</li>
                                <li>Unauthorized use or sharing of accounts is prohibited.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">3. Role-Based Responsibilities</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Admins manage users, course assignments, and enrollment lifecycle.</li>
                                <li>Teachers generate attendance sessions and review course attendance.</li>
                                <li>Students mark attendance only for active course enrollments.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">4. Data Integrity and Security Rules</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>QR codes are time-limited and protected by server-side validation.</li>
                                <li>Duplicate attendance attempts are blocked.</li>
                                <li>Audit logging is enabled for critical actions.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">5. Privacy and Compliance</h2>
                            <p>
                                Users agree that personal data is processed only for attendance, security, and reporting needs,
                                as described in the Privacy Policy. Institutions remain responsible for legal compliance in their
                                jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">6. Service Availability</h2>
                            <p>
                                The service is provided on a best-effort basis. Maintenance, updates, or unexpected downtime may
                                occur. Security updates may be applied without prior notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">7. Support</h2>
                            <p>
                                For usage or policy questions, contact support at{' '}
                                <a className="font-medium text-blue-700 hover:underline" href="mailto:alain.enspd@gmail.com">
                                    alain.enspd@gmail.com
                                </a>
                                .
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
