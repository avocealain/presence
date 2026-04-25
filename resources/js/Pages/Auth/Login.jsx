import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white mb-4">
                            <LockClosedIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                            {status}
                        </div>
                    )}

                    {/* Login Form Card */}
                    <Card variant="elevated" className="mb-6">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-2 block w-full"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-2 block w-full"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-2">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData('remember', e.target.checked)
                                        }
                                    />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-3">
                                <PrimaryButton
                                    className="w-full justify-center"
                                    loading={processing}
                                    loadingText="Signing in..."
                                >
                                    Sign In
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>

                    {/* Links */}
                    <div className="text-center text-sm text-gray-600">
                        {canResetPassword && (
                            <>
                                <Link
                                    href={route('password.request')}
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                                <span className="mx-2">•</span>
                            </>
                        )}
                        <Link
                            href={route('register')}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
