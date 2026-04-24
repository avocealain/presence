# 🚀 Quick Start Guide

## Prerequisites
- PHP 8.3+
- MySQL 8.0+
- Node.js 18+

## 1️⃣ Initial Setup (One-time)

```bash
# Create database
mysql -u root -e "CREATE DATABASE yoklama;"

# Run migrations
php artisan migrate
```

## 2️⃣ Start Development Servers

**Terminal 1:**
```bash
php artisan serve
# Server runs at http://localhost:8000
```

**Terminal 2:**
```bash
npm run dev
# Vite dev server with hot reload
```

## 3️⃣ Access the Application

- **Home**: http://localhost:8000
- **Register**: http://localhost:8000/register
- **Login**: http://localhost:8000/login
- **Dashboard**: http://localhost:8000/dashboard (after login)

## 📝 Default Credentials

Create a test user via registration or:
```bash
php artisan tinker
# Then execute:
# App\Models\User::create(['name' => 'Test', 'email' => 'test@example.com', 'password' => bcrypt('password')])
```

## 🎯 Project Structure

```
resources/js/
├── Pages/           ← Add new page components here
├── Components/      ← Reusable UI components
├── Layouts/         ← Layout templates
└── app.jsx          ← Entry point

routes/web.php       ← Define routes here

app/Http/
├── Controllers/     ← Business logic
└── Middleware/      ← Route guards
```

## 🔑 Key Technologies

| Technology | Purpose |
|-----------|---------|
| Laravel | Backend API & routing |
| Inertia.js | Server-side rendering bridge |
| React | Frontend UI |
| Tailwind CSS | Styling |
| Vite | Build tool |
| MySQL | Database |

## 📚 Next Steps

1. Build the **Database Schema** (users, classes, QR codes, attendance)
2. Create **Role-Based Access Control** (admin, teacher, student)
3. Implement **QR Code Generation & Scanning**
4. Build **Attendance Validation & Storage**
5. Create **Analytics Dashboard**

## ❓ Need Help?

- See `SETUP.md` for detailed documentation
- Check Laravel docs: https://laravel.com/docs
- Check Inertia docs: https://inertiajs.com
