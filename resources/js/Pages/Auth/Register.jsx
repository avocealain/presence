import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlusIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white mb-4">
                            <UserPlusIcon className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                        <p className="text-gray-600 mt-2">Sign up to get started</p>
                    </div>

                    {/* Register Form Card */}
                    <Card variant="elevated" className="mb-6">
                        <form onSubmit={submit} className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-2 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

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
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    required
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
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirm Password"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-2 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-3">
                                <PrimaryButton
                                    className="w-full justify-center"
                                    loading={processing}
                                    loadingText="Creating account..."
                                >
                                    Create Account
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>

                    {/* Links */}
                    <div className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
