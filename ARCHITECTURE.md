# Architecture & Technical Decisions

## System Overview

```
┌─────────────────────────────────────────────────┐
│           Browser (React/Inertia.js)            │
│  ┌──────────────────────────────────────────┐   │
│  │     React Components & Pages             │   │
│  │  (Dashboard, QR Scanner, Analytics)      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         ▲                                  │
         │ HTTP (Inertia)                   │ HTTP
         │                                  ▼
┌─────────────────────────────────────────────────┐
│          Laravel Backend (Routes)               │
│  ┌──────────────────────────────────────────┐   │
│  │ - Web Routes (HTML via Inertia)          │   │
│  │ - API Routes (JSON for mobile)           │   │
│  │ - Auth Middleware (Sanctum tokens)       │   │
│  │ - CSRF Protection (built-in)             │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Controllers & Business Logic             │   │
│  │ - UserController                         │   │
│  │ - QrCodeController                       │   │
│  │ - AttendanceController                   │   │
│  │ - DashboardController                    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         ▲                           │
         │                           │ SQL
         │ ORM (Eloquent)            │
         │                           ▼
┌─────────────────────────────────────────────────┐
│              MySQL Database                      │
│  ┌──────────────────────────────────────────┐   │
│  │ - users (role-based access)              │   │
│  │ - classes (teacher's classes)            │   │
│  │ - qr_codes (session-specific)            │   │
│  │ - attendance_records (validated)         │   │
│  │ - action_logs (security audit)           │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Data Flow: Attendance Marking

```
Student submits QR scan
           ↓
POST /api/attendance/submit (student token)
           ↓
AttendanceController::store()
           ↓
┌─ Validate QR Code exists
├─ Check session active & not expired (30s window)
├─ Verify one-time usage (prevent duplicates)
├─ Record attendee info (name, email, timestamp)
└─ Log action (user_id, timestamp, ip_address)
           ↓
Return success/error JSON
           ↓
React updates UI (success message or error)
```

## Authentication & Authorization

### Session-Based (Web)
```
User → Login Form → Breeze Auth
            ↓
     Session Created (DB)
            ↓
     Middleware 'auth' protects routes
            ↓
     User available via usePage().props.auth.user
```

### Token-Based (Mobile/API - future)
```
Mobile App → POST /api/login (credentials)
            ↓
     Laravel Sanctum generates token
            ↓
     Bearer token sent in Authorization header
            ↓
     Middleware 'auth:sanctum' validates
            ↓
     API endpoint responds with data
```

### Role-Based Access Control (RBAC)
```
User roles:
- admin: All access, user management, analytics
- teacher: Create QR codes, view class attendance
- student: Scan codes, view own attendance

Middleware: $middleware->role('teacher')
           ↓
Checks user.role and authorizes
```

## Frontend Component Hierarchy

```
<App (Inertia Setup)>
│
├─ <AuthenticatedLayout>          ← Main layout for logged-in users
│  ├─ <Navbar>                    ← Top fixed navbar
│  │  ├─ Logo/Title
│  │  └─ UserDropdown
│  │
│  ├─ <Sidebar>                   ← Fixed left sidebar
│  │  └─ NavItems (role-based)
│  │
│  └─ <MainContent>               ← Responsive content area
│     └─ <Page Component>          ← Dashboard, etc.
│
└─ <GuestLayout>                  ← For auth pages
   ├─ Logo
   └─ <AuthPage>                  ← Login, Register, etc.
```

## Key Design Decisions

### 1. Inertia.js Over REST API
**Why:** 
- Real-time data binding without prop drilling
- Server controls routing & security
- Simplified frontend state management
- Built-in history/back button support

**Tradeoff:** Can't use standalone frontend (tightly coupled)

### 2. Session-Based Auth Over JWT
**Why:**
- Laravel Breeze includes session setup
- Server-side session invalidation (logout immediately effective)
- CSRF protection automatic
- Simpler for SSR applications

**Future:** Add Sanctum for mobile token auth

### 3. Tailwind CSS Over Component Library
**Why:**
- Highly customizable
- No bloated CSS bundles
- Minimal learning curve
- Responsive utilities built-in

### 4. Vite Over Webpack
**Why:**
- ~10x faster HMR (hot module reload)
- Smaller build output
- Modern ES modules
- Better dev experience

## Security Considerations

### ✅ Implemented
- **CSRF Protection**: Inertia handles automatically
- **SQL Injection Prevention**: Eloquent ORM parameterized queries
- **XSS Protection**: React auto-escapes content
- **Authentication**: Laravel Breeze with password hashing (bcrypt)
- **Session Security**: HttpOnly cookies, sameSite=lax

### 🔒 To Implement
- **QR Validation**: Time-based expiration (30 seconds)
- **Duplicate Prevention**: Check attendance_records table before insert
- **Rate Limiting**: Limit API requests per IP/user
- **Audit Logging**: Log all attendance actions
- **Role-Based Routes**: Middleware for access control

## Database Schema (Outline)

```sql
-- users (existing from Breeze)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin', 'teacher', 'student'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- classes (teacher's class sections)
CREATE TABLE classes (
    id INT PRIMARY KEY,
    teacher_id INT FOREIGN KEY,
    name VARCHAR(255),
    course_code VARCHAR(50),
    created_at TIMESTAMP
);

-- qr_codes (session-specific)
CREATE TABLE qr_codes (
    id INT PRIMARY KEY,
    class_id INT FOREIGN KEY,
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);

-- attendance_records (final attendance data)
CREATE TABLE attendance_records (
    id INT PRIMARY KEY,
    student_id INT FOREIGN KEY,
    qr_code_id INT FOREIGN KEY,
    class_id INT FOREIGN KEY,
    marked_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP
);

-- action_logs (audit trail)
CREATE TABLE action_logs (
    id INT PRIMARY KEY,
    user_id INT FOREIGN KEY,
    action VARCHAR(255),
    entity_type VARCHAR(255),
    entity_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP
);
```

## Deployment Considerations

### Server Requirements
- PHP 8.3+
- MySQL 8.0+
- Node.js 18+ (build server only)
- Supervisor or systemd (queue/scheduler)

### Build Process
```bash
npm run build          # Vite builds React into public/build/
php artisan optimize   # Cache config, routes, etc.
php artisan migrate    # Run pending migrations
```

### Environment
```env
APP_ENV=production
APP_DEBUG=false
CACHE_DRIVER=redis (or memcached)
SESSION_DRIVER=database
QUEUE_CONNECTION=database (or redis)
```

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy-load page components
- **CSS Purging**: Tailwind removes unused styles in production
- **Image Optimization**: Compress QR codes, avatars
- **Caching**: Browser cache, Redis for session data

### Backend
- **Query Optimization**: Eager load relations (N+1 query prevention)
- **Database Indexing**: Index user_id, qr_code_id on attendance_records
- **Rate Limiting**: Prevent abuse of QR endpoints
- **Caching**: Cache frequently accessed data (classes, users)

## Monitoring & Logging

```php
// Log action
Log::channel('attendance')->info('Attendance marked', [
    'student_id' => $student->id,
    'qr_code_id' => $qrCode->id,
    'timestamp' => now(),
    'ip' => request()->ip()
]);

// Error tracking (Sentry integration recommended)
// Uptime monitoring (New Relic, DataDog)
// Performance monitoring (APM tools)
```

## Future Enhancements

1. **Mobile App**: Native iOS/Android with Sanctum tokens
2. **Real-time Updates**: WebSocket for live attendance feeds
3. **Advanced Analytics**: Charts, trends, predictions
4. **Integration**: LMS integration (Moodle, Canvas), grade sync
5. **Biometric**: Fingerprint/face recognition as backup
6. **Notifications**: Email/SMS reminders, absence alerts
7. **Batch Operations**: Import/export attendance data
8. **Multi-campus**: Support multiple institutions

---

**Architecture designed for:** Scalability, Security, Maintainability
