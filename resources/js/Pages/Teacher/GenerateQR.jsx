import React, { useState, useEffect } from 'react';
import TeacherLayout from '@/Components/TeacherLayout';
import { useForm } from '@inertiajs/react';

export default function GenerateQR({ auth, course }) {
    const [qrCode, setQrCode] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [attendanceCount, setAttendanceCount] = useState(0);
    const { post, processing } = useForm();

    useEffect(() => {
        if (timeRemaining <= 0) {
            setQrCode(null);
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const generateQR = () => {
        setTimeRemaining(30);
        post(`/courses/${course.id}/qr`, {
            onSuccess: (response) => {
                // Mock QR code generation - in real app, this would come from server
                setQrCode(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`);
                setAttendanceCount(0);
            }
        });
    };

    const refreshQR = () => {
        post(`/courses/${course.id}/qr/refresh`, {
            onSuccess: () => {
                setTimeRemaining(30);
                setAttendanceCount(attendanceCount + 1);
            }
        });
    };

    return (
        <TeacherLayout user={auth.user} title="Generate QR Code">
            <div className="space-y-6">
                {/* Course Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-green-600 uppercase">{course.code}</p>
                            <h2 className="text-2xl font-bold text-gray-900">{course.name}</h2>
                            <p className="text-gray-600 mt-1">{course.activeEnrollments?.length || 0} students enrolled</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Current Session</p>
                            <p className="text-2xl font-bold text-green-600">{course.code}</p>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Display */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            {qrCode ? (
                                <>
                                    <div className="w-full max-w-xs aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                        <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-600 mb-2">Time Remaining</p>
                                        <p className={`text-4xl font-bold ${timeRemaining > 10 ? 'text-green-600' : 'text-red-600'}`}>
                                            {timeRemaining}s
                                        </p>
                                    </div>
                                    <div className="w-full">
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${timeRemaining > 10 ? 'bg-green-600' : 'bg-red-600'}`}
                                                style={{ width: `${(timeRemaining / 30) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={refreshQR}
                                            disabled={processing}
                                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Refresh QR
                                        </button>
                                        <button
                                            onClick={() => setQrCode(null)}
                                            className="flex-1 px-4 py-3 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Take Attendance?</h3>
                                        <p className="text-gray-600 mb-6">Click the button below to generate a QR code for your students to scan</p>
                                    </div>
                                    <button
                                        onClick={generateQR}
                                        disabled={processing}
                                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        Generate QR Code
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Live Stats */}
                    <div className="space-y-4">
                        {/* Attendance Live Count */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                            <p className="text-gray-600 mb-2">Students Present</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-5xl font-bold text-green-600">{attendanceCount}</p>
                                <p className="text-gray-600">of {course.activeEnrollments?.length || 0}</p>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-green-600 transition-all"
                                    style={{ width: `${(attendanceCount / (course.activeEnrollments?.length || 1)) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {((attendanceCount / (course.activeEnrollments?.length || 1)) * 100).toFixed(1)}% attendance rate
                            </p>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h4 className="font-bold text-gray-900 mb-3">📌 Tips</h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>✓ Each QR code expires after 30 seconds</li>
                                <li>✓ Students can only scan once per QR code</li>
                                <li>✓ Click "Refresh QR" to generate a new code</li>
                                <li>✓ Attendance is marked in real-time</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <a href={`/courses/${course.id}/attendance`} className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition-colors">
                                View Attendance Report
                            </a>
                            <a href="/teacher/courses" className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors">
                                Back to Courses
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
