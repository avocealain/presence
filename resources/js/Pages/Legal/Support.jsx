import { Head, Link } from '@inertiajs/react';

export default function Support() {
    return (
        <>
            <Head title="Support - Smart Attendance System" />
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">Support</h1>
                        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            Back to Home
                        </Link>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">Contact</h2>
                            <p className="mb-2">
                                For technical help, account issues, attendance corrections, or privacy questions, contact:
                            </p>
                            <p>
                                Email:{' '}
                                <a className="font-medium text-blue-700 hover:underline" href="mailto:alain.enspd@gmail.com">
                                    alain.enspd@gmail.com
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">What to Include in Your Request</h2>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>Your name and role (admin, teacher, student).</li>
                                <li>Course code and class date when relevant.</li>
                                <li>A short description of the issue and expected result.</li>
                                <li>Screenshots or error messages when available.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">Data Protection in Support Cases</h2>
                            <p className="mb-2">
                                Support requests may include limited personal data strictly needed to resolve your issue.
                            </p>
                            <ul className="list-disc space-y-1 pl-6">
                                <li>We only process information required for troubleshooting and verification.</li>
                                <li>We do not request your password by email.</li>
                                <li>Access to support data is restricted to authorized staff.</li>
                                <li>Support history may be retained for security and service quality.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-2 text-xl font-semibold text-slate-900">Emergency Access Issue</h2>
                            <p>
                                If you cannot access your account before a class session, contact support immediately and include
                                your institution, role, and account email for faster handling.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
