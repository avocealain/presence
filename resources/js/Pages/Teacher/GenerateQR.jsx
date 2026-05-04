import React, { useEffect, useMemo, useState } from 'react';
import TeacherLayout from '@/Components/TeacherLayout';
import { useToast } from '@/Components/ToastContext';

export default function GenerateQR({ auth, course, current_qr, current_session }) {
    const toast = useToast();

    const ensureAbsoluteHttpsUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('https://')) return url;
        if (url.startsWith('http://')) return url.replace(/^http:/, 'https:');
        if (url.startsWith('//')) return `https:${url}`;
        if (url.startsWith('/')) return `${window.location.origin}${url}`;
        return url;
    };

    const initialTime = current_qr?.time_remaining ?? 0;
    const initialQrUrl = ensureAbsoluteHttpsUrl(current_qr?.qr_url ?? null);
    const initialCount = current_qr?.attendance_count ?? 0;

    const [qrCode, setQrCode] = useState(initialQrUrl);
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const [validitySeconds, setValiditySeconds] = useState(initialTime > 0 ? initialTime : 300);
    const [attendanceCount, setAttendanceCount] = useState(initialCount);
    const [processingAction, setProcessingAction] = useState(false);
    const [sessionMeta, setSessionMeta] = useState(current_session ?? null);
    const [locationStatus, setLocationStatus] = useState(
        current_session?.location_required ? 'enabled' : 'fallback',
    );
    const enrolledCount = course.active_enrollments_count ?? course.activeEnrollments?.length ?? 0;

    const hasActiveCode = useMemo(() => Boolean(qrCode) && timeRemaining > 0, [qrCode, timeRemaining]);

    useEffect(() => {
        if (!hasActiveCode) {
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [hasActiveCode]);

    useEffect(() => {
        if (timeRemaining === 0) {
            setQrCode(null);
        }
    }, [timeRemaining]);

    const extractErrorMessage = (error, fallbackMessage) => {
        return (
            error?.response?.data?.message ||
            error?.message ||
            fallbackMessage
        );
    };

    const captureTeacherLocation = async () => {
        const approved = window.confirm('This class session requires location verification. Do you approve sharing your location?');
        if (!approved) {
            setLocationStatus('fallback');
            toast.warning('Location sharing denied. Session fallback mode will be used.');
            return null;
        }

        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            toast.warning('Geolocation is not supported in this browser. Session fallback mode will be used.');
            return null;
        }

        toast.info('Requesting location permission...');

        return await new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                setLocationStatus('fallback');
                toast.warning('Location request timed out. Using fallback mode.');
                resolve(null);
            }, 25000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    setLocationStatus('enabled');
                    toast.success('Location captured successfully.');
                    resolve({
                        latitude: Number(position.coords.latitude),
                        longitude: Number(position.coords.longitude),
                        accuracy: Number(position.coords.accuracy || 0),
                    });
                },
                (error) => {
                    clearTimeout(timeoutId);
                    setLocationStatus('fallback');
                    const errorMsg = error.code === error.PERMISSION_DENIED
                        ? 'Location permission denied. Using fallback mode.'
                        : 'Could not retrieve location. Using fallback mode.';
                    toast.warning(errorMsg);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0,
                },
            );
        });
    };

    const requestQRSession = async (endpoint, successMessage, withLocation = false) => {
        setProcessingAction(true);

        try {
            const requestPayload = {};
            if (withLocation) {
                const teacherLocation = await captureTeacherLocation();
                if (teacherLocation) {
                    requestPayload.location = teacherLocation;
                }
            }

            const response = await window.axios.post(endpoint, requestPayload);
            const responsePayload = response?.data || {};

            if (!responsePayload.success) {
                throw new Error(responsePayload.message || 'QR request failed.');
            }

            setQrCode(ensureAbsoluteHttpsUrl(responsePayload.qr_url));
            setTimeRemaining(responsePayload.expires_in ?? responsePayload.validity_seconds ?? 300);
            setValiditySeconds(responsePayload.validity_seconds ?? 300);
            setAttendanceCount(responsePayload.attendance_count ?? 0);
            setSessionMeta({
                id: responsePayload.class_session_id,
                ends_at: responsePayload.class_session_ends_at,
                location_required: responsePayload.location_required,
                allowed_radius_meters: responsePayload.location_radius_meters,
            });
            setLocationStatus(responsePayload.location_required ? 'enabled' : 'fallback');

            toast.success(successMessage);
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to process QR request.'));
        } finally {
            setProcessingAction(false);
        }
    };

    const generateQR = async () => {
        toast.info('Generating QR code...');
        await requestQRSession(`/courses/${course.id}/qr`, 'QR code generated successfully.', true);
    };

    const refreshQR = async () => {
        toast.info('Refreshing QR code...');
        await requestQRSession(`/courses/${course.id}/qr/refresh`, 'New QR code generated.', false);
    };

    const stopQR = async () => {
        setProcessingAction(true);

        try {
            await window.axios.post(`/courses/${course.id}/qr/stop`);
            setQrCode(null);
            setTimeRemaining(0);
            setSessionMeta(null);
            toast.info('QR session stopped.');
        } catch (error) {
            toast.error(extractErrorMessage(error, 'Failed to stop QR session.'));
        } finally {
            setProcessingAction(false);
        }
    };

    return (
        <TeacherLayout user={auth.user} title="Generate QR Code">
            <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase text-green-600">{course.code}</p>
                            <h2 className="text-2xl font-bold text-gray-900">{course.name}</h2>
                            <p className="mt-1 text-gray-600">{enrolledCount} students enrolled</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Current Session</p>
                            <p className="text-2xl font-bold text-green-600">{course.code}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-8">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            {hasActiveCode ? (
                                <>
                                    <div className="aspect-square w-full max-w-xs rounded-lg border-2 border-dashed border-gray-300 bg-gray-100">
                                        <img src={qrCode} alt="QR Code" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-2 text-gray-600">Time Remaining</p>
                                        <p className={`text-4xl font-bold ${timeRemaining > 10 ? 'text-green-600' : 'text-red-600'}`}>
                                            {timeRemaining}s
                                        </p>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className={`h-full transition-all duration-500 ${timeRemaining > 10 ? 'bg-green-600' : 'bg-red-600'}`}
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, (timeRemaining / Math.max(1, validitySeconds)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex w-full gap-3">
                                        <button
                                            onClick={refreshQR}
                                            disabled={processingAction}
                                            className={`flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 ${
                                                processingAction ? 'cursor-not-allowed opacity-50' : ''
                                            }`}
                                        >
                                            {processingAction ? 'Please wait...' : 'Refresh QR'}
                                        </button>
                                        <button
                                            onClick={stopQR}
                                            disabled={processingAction}
                                            className="flex-1 rounded-lg bg-red-100 px-4 py-3 font-medium text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                                        <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="mb-2 text-lg font-bold text-gray-900">Ready to take attendance?</h3>
                                        <p className="mb-6 text-gray-600">Generate a QR code so students can scan and mark attendance.</p>
                                    </div>
                                    <button
                                        onClick={generateQR}
                                        disabled={processingAction}
                                        className={`w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 ${
                                            processingAction ? 'cursor-not-allowed opacity-50' : ''
                                        }`}
                                    >
                                        {processingAction ? 'Generating...' : 'Generate QR Code'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-6">
                            <p className="mb-2 text-gray-600">Students Present</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-5xl font-bold text-green-600">{attendanceCount}</p>
                                <p className="text-gray-600">of {enrolledCount}</p>
                            </div>
                            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full bg-green-600 transition-all"
                                    style={{
                                        width: `${Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                ((attendanceCount || 0) / Math.max(1, enrolledCount)) * 100,
                                            ),
                                        )}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                {(((attendanceCount || 0) / Math.max(1, enrolledCount)) * 100).toFixed(1)}% attendance rate
                            </p>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                            <h4 className="mb-3 font-bold text-gray-900">Tips</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>Each QR code expires quickly for anti-fraud protection.</li>
                                <li>A student can scan only once per class session.</li>
                                <li>Use "Refresh QR" to issue a new code immediately.</li>
                                <li>Use "Stop" to close the current session.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-700">
                            <p className="font-semibold text-gray-900">Session Controls</p>
                            <p className="mt-2">
                                {sessionMeta
                                    ? `Active session #${sessionMeta.id} - ${sessionMeta.location_required ? 'Location verification enabled' : 'Fallback mode'}`
                                    : 'No active class session'}
                            </p>
                            {sessionMeta?.ends_at && (
                                <p className="mt-1 text-xs text-gray-500">Session ends at: {new Date(sessionMeta.ends_at).toLocaleString()}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Location status: {locationStatus === 'enabled' ? 'Enabled' : locationStatus === 'unsupported' ? 'Unsupported browser' : 'Fallback'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <a href={`/courses/${course.id}/attendance`} className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700">
                                View Attendance Report
                            </a>
                            <a href="/teacher/courses" className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-200">
                                Back to Courses
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
