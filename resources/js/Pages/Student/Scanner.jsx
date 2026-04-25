import React, { useEffect, useRef, useState } from 'react';
import StudentLayout from '@/Components/StudentLayout';
import { useToast } from '@/Components/ToastContext';
import jsQR from 'jsqr';

function detectBrowser(userAgent) {
    if (userAgent.includes('Edg/')) return 'Edge';
    if (userAgent.includes('Chrome/')) return 'Chrome';
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
    if (userAgent.includes('Firefox/')) return 'Firefox';
    return 'Unknown';
}

function detectOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
}

export default function Scanner({ auth, courses }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const scannerLoopRef = useRef(null);
    const isScanningRef = useRef(false);

    const [cameraActive, setCameraActive] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scannedToken, setScannedToken] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(courses?.[0]?.id || '');
    const [lastLocation, setLastLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('unknown');
    const toast = useToast();

    const clearScannerLoop = () => {
        if (scannerLoopRef.current) {
            clearInterval(scannerLoopRef.current);
            scannerLoopRef.current = null;
        }
    };

    const stopCamera = () => {
        isScanningRef.current = false;
        clearScannerLoop();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraActive(false);
        setScanning(false);
    };

    const extractSubmitError = (error) => {
        const responseData = error?.response?.data;
        const tokenError = responseData?.errors?.token?.[0];
        const genericMessage = responseData?.message;

        if (tokenError) {
            return tokenError;
        }

        if (genericMessage) {
            return genericMessage;
        }

        if (error?.response?.status === 401) {
            return 'Authentication required. Please log in again.';
        }

        if (error?.response?.status === 403) {
            return 'You are not authorized to submit attendance.';
        }

        return 'Failed to record attendance.';
    };

    const submitAttendance = async (token) => {
        setIsSubmitting(true);

        const userAgent = navigator.userAgent || 'Unknown';
        const locationPayload = await captureLocation(true);

        try {
            const response = await window.axios.post('/api/attendance/submit', {
                token,
                course_id: selectedCourse,
                device_info: {
                    os: detectOS(userAgent),
                    browser: detectBrowser(userAgent),
                },
                location: locationPayload,
            });

            const payload = response?.data || {};
            toast.success(payload.message || 'Attendance recorded successfully.');
            setScannedToken(null);

            // Restart scanner after a short delay for next session.
            setTimeout(() => {
                startCamera();
            }, 2000);
        } catch (error) {
            toast.error(extractSubmitError(error));
            setScannedToken(null);

            setTimeout(() => {
                startCamera();
            }, 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const captureLocation = async (silent = false) => {
        if (!navigator.geolocation) {
            setLocationStatus('unsupported');
            if (!silent) {
                toast.warning('Geolocation is not supported in this browser. Attendance fallback will be used.');
            }
            return null;
        }

        return await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const payload = {
                        latitude: Number(position.coords.latitude),
                        longitude: Number(position.coords.longitude),
                        accuracy: Number(position.coords.accuracy || 0),
                    };

                    setLastLocation(payload);
                    setLocationStatus('ready');
                    resolve(payload);
                },
                (error) => {
                    if (error?.code === 1) {
                        setLocationStatus('denied');
                        if (!silent) {
                            toast.warning('Location permission denied. Attendance fallback may apply based on session policy.');
                        }
                    } else if (error?.code === 3) {
                        setLocationStatus('timeout');
                        if (!silent) {
                            toast.warning('Location timeout. Continuing with fallback.');
                        }
                    } else {
                        setLocationStatus('error');
                        if (!silent) {
                            toast.warning('Unable to get location. Continuing with fallback.');
                        }
                    }

                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000,
                },
            );
        });
    };

    const startScanningLoop = () => {
        clearScannerLoop();

        scannerLoopRef.current = setInterval(() => {
            if (!isScanningRef.current || !videoRef.current || !canvasRef.current) {
                return;
            }

            const video = videoRef.current;

            if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
                return;
            }

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) {
                return;
            }

            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code?.data) {
                const token = code.data.trim();
                isScanningRef.current = false;
                setScanning(false);
                setScannedToken(token);
                stopCamera();
                toast.info('QR code detected. Submitting attendance...');
                submitAttendance(token);
            }
        }, 120);
    };

    const startCamera = async () => {
        if (!selectedCourse) {
            toast.warning('Please select a course first.');
            return;
        }

        try {
            stopCamera();
            setPermissionDenied(false);
            await captureLocation(false);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            isScanningRef.current = true;
            setCameraActive(true);
            setScanning(true);
            startScanningLoop();
            toast.info('Camera started. Point at the QR code.');
        } catch (error) {
            if (error?.name === 'NotAllowedError') {
                setPermissionDenied(true);
                toast.error('Camera permission denied. Enable camera access in browser settings.');
            } else if (error?.name === 'NotFoundError') {
                toast.error('No camera device found.');
            } else {
                toast.error(`Failed to access camera: ${error?.message || 'Unknown error'}`);
            }

            stopCamera();
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <StudentLayout user={auth.user} title="Scan Attendance">
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">Scan QR Code</h2>
                    <p className="text-gray-700">Point your camera at the QR code displayed by your teacher.</p>
                </div>

                {courses && courses.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                        <label className="mb-3 block text-sm font-medium text-gray-700">Select Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            disabled={cameraActive || isSubmitting}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                        >
                            <option value="">-- Select a course --</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {permissionDenied && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="font-medium text-red-800">Camera access denied</p>
                        <p className="mt-1 text-sm text-red-700">Enable camera permission in your browser settings, then try again.</p>
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Location status</p>
                    <p className="mt-1">
                        {locationStatus === 'ready' && 'Location ready for verification.'}
                        {locationStatus === 'denied' && 'Location denied. Fallback mode in use.'}
                        {locationStatus === 'unsupported' && 'Geolocation unsupported. Fallback mode in use.'}
                        {locationStatus === 'timeout' && 'Location timeout. Fallback mode in use.'}
                        {locationStatus === 'error' && 'Location unavailable. Fallback mode in use.'}
                        {locationStatus === 'unknown' && 'Location not requested yet.'}
                    </p>
                    {lastLocation && (
                        <p className="mt-1 text-xs text-gray-500">
                            Last fix: {lastLocation.latitude.toFixed(5)}, {lastLocation.longitude.toFixed(5)} (±{Math.round(lastLocation.accuracy)}m)
                        </p>
                    )}
                </div>

                <div className="relative aspect-video overflow-hidden rounded-lg border-4 border-gray-300 bg-gray-900">
                    {cameraActive ? (
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
                            <svg className="mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="font-medium text-gray-500">Camera is off</p>
                        </div>
                    )}

                    {scanning && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="h-48 w-48 animate-pulse rounded-lg border-2 border-green-400" />
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-4">
                    {!cameraActive ? (
                        <button
                            onClick={startCamera}
                            disabled={!selectedCourse || isSubmitting}
                            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {!selectedCourse ? 'Select a course first' : isSubmitting ? 'Submitting...' : 'Start Camera'}
                        </button>
                    ) : (
                        <button
                            onClick={stopCamera}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Stop Camera
                        </button>
                    )}
                </div>

                {scannedToken && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-2 text-sm text-gray-600">Scanned Token</p>
                        <p className="break-all font-mono text-xs text-blue-900">{scannedToken}</p>
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-3 font-semibold text-gray-900">How to use</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>1. Select your course.</li>
                        <li>2. Start the camera.</li>
                        <li>3. Point your camera at the teacher QR code.</li>
                        <li>4. Wait for automatic attendance confirmation.</li>
                    </ul>
                </div>
            </div>
        </StudentLayout>
    );
}
