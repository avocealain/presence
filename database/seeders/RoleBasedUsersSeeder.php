<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleBasedUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department' => 'Administration',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create teacher user
        User::updateOrCreate(['email' => 'teacher@example.com'], [
            'name' => 'Teacher User',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'department' => 'Computer Science',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create student user
        User::updateOrCreate(['email' => 'student@example.com'], [
            'name' => 'Student User',
            'password' => Hash::make('password'),
            'role' => 'student',
            'department' => 'Computer Science',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create additional test students
        for ($i = 2; $i <= 5; $i++) {
            User::updateOrCreate(['email' => "student$i@example.com"], [
                'name' => "Student $i",
                'password' => Hash::make('password'),
                'role' => 'student',
                'department' => 'Computer Science',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
