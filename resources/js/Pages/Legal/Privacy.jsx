import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy - Smart Attendance System" />
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            Back to Home
                        </Link>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">1. Purpose</h2>
                            <p>
                                This policy explains how Smart Attendance System collects, uses, stores, and protects personal data
                                while providing QR-based attendance tracking for students, teachers, and administrators.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">2. Data We Collect</h2>
                            <p className="mb-2">Depending on your role and activity, we may process:</p>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Identity data: name, email, role (admin, teacher, student).</li>
                                <li>Attendance data: course, attendance date/time, attendance status.</li>
                                <li>Security and traceability data: IP address, user agent, audit logs.</li>
                                <li>Optional location data: only when enabled for a class session.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">3. Why We Use This Data</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Record attendance accurately and prevent duplicate marks.</li>
                                <li>Protect the system against fraud and unauthorized use.</li>
                                <li>Provide reports to authorized education staff.</li>
                                <li>Maintain accountability through audit and security logs.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">4. Access and Confidentiality</h2>
                            <p>
                                Access is role-based. Students can only access their own attendance data. Teachers can only access
                                data for their own courses. Administrators can manage user and course assignments under institutional
                                governance rules.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">5. Data Retention and Security</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Data is stored in secured application databases.</li>
                                <li>Authentication and role controls limit unauthorized access.</li>
                                <li>Audit logs are retained for security and compliance purposes.</li>
                                <li>Expired QR sessions are deactivated and no longer valid for attendance.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">6. Your Rights</h2>
                            <p>
                                You may request access, correction, or review of your personal data through your institution and
                                system administrator, in line with your local legal and institutional requirements.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">7. Contact</h2>
                            <p>
                                For privacy questions, contact support at{' '}
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
