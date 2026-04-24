<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RoleBasedUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'department' => 'Administration',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create teacher user
        User::create([
            'name' => 'Teacher User',
            'email' => 'teacher@example.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'department' => 'Computer Science',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create student user
        User::create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'department' => 'Computer Science',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create additional test students
        for ($i = 2; $i <= 5; $i++) {
            User::create([
                'name' => "Student $i",
                'email' => "student$i@example.com",
                'password' => bcrypt('password'),
                'role' => 'student',
                'department' => 'Computer Science',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
