# Quick Testing Script

## 1. Quick Setup (5 minutes)

```bash
# Terminal 1: Setup & Start Server
cd /path/to/yoklama

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate --seed  # If seeders exist, or manually:
php artisan migrate

# Create storage link for QR images
php artisan storage:link

# Build frontend
npm run build

# Start Laravel server
php artisan serve
# Server running at: http://localhost:8000
```

```bash
# Terminal 2: Build frontend (optional - for hot reload during development)
npm run dev
```

---

## 2. Create Test Users (2 minutes)

```bash
# Terminal 3: Create users via Tinker
php artisan tinker

# Create Admin
$admin = User::factory()->create([
    'name' => 'Admin User',
    'email' => 'admin@test.com',
    'password' => bcrypt('password'),
    'role' => 'admin',
    'email_verified_at' => now()
]);

# Create Teacher
$teacher = User::factory()->create([
    'name' => 'John Teacher',
    'email' => 'teacher@test.com',
    'password' => bcrypt('password'),
    'role' => 'teacher',
    'email_verified_at' => now()
]);

# Create Student
$student = User::factory()->create([
    'name' => 'Jane Student',
    'email' => 'student@test.com',
    'password' => bcrypt('password'),
    'role' => 'student',
    'email_verified_at' => now()
]);

# Create Course
$course = Course::factory()->create([
    'teacher_id' => $teacher->id,
    'code' => 'CS101',
    'name' => 'Intro to Computer Science'
]);

# Enroll Student
CourseEnrollment::create([
    'course_id' => $course->id,
    'student_id' => $student->id,
    'status' => 'active',
    'enrolled_at' => now()
]);

exit
```

---

## 3. Test Scenarios (Browser)

### **Test Admin Dashboard**
```
1. Go to: http://localhost:8000/login
2. Email: admin@test.com
3. Password: password
4. Click Login
5. Should see: /admin/dashboard
6. View:
   - Stats cards (Users, Teachers, Students, Courses, Attendance)
   - Quick action buttons
7. Click "Manage Users" → /admin/users
8. Search & filter users
9. Click "Manage Courses" → /admin/courses
10. View courses
```

### **Test Teacher QR Generation**
```
1. Go to: http://localhost:8000/login
2. Email: teacher@test.com
3. Password: password
4. Click Login
5. Should see: /teacher/dashboard
6. Click "Generate QR" button
7. Wait for QR code to generate
8. Verify:
   - Real PNG image displays
   - 30-second countdown timer
   - Refresh button works
   - Counter shows 0/0 attendance
9. Click "Refresh" → new QR generated
10. Keep QR visible for next test
```

### **Test Student QR Scanning**
```
1. Open SECOND browser window/tab or SECOND device
2. Go to: http://localhost:8000/login
3. Email: student@test.com
4. Password: password
5. Click Login
6. Should see: /student/dashboard
7. Click "📱 Scan Attendance" in sidebar
8. Page loads: /student/scanner
9. Select course from dropdown
10. Click "📷 Start Camera"
11. Browser requests camera permission
12. Click "Allow" to grant access
13. Live camera preview displays
14. Point camera at teacher's QR code (from first window)
15. Hold steady for 1-2 seconds
16. QR auto-detects
17. Verify:
    - "QR code scanned!" message
    - Token submitted
    - "✓ Attendance recorded!" appears
    - Camera auto-restarts
18. Check /student/attendance-history
19. New attendance record appears
```

### **Test Duplicate Prevention**
```
1. In student scanner: QR still visible from first window
2. Try scanning same QR again
3. Should see error: "You have already marked attendance for this session"
4. Go back to teacher (first window)
5. Click "Refresh" QR
6. Back to student scanner
7. Scan NEW QR
8. Should succeed (different QR session)
9. Verify in /student/attendance-history
10. Two attendance records now exist
```

### **Test 30-Second Expiration**
```
1. Teacher generates new QR
2. Student waits 30+ seconds
3. Try to scan old QR
4. Should see error: "This QR code has expired"
5. Teacher clicks "Refresh"
6. Student scans new QR
7. Should succeed
```

---

## 4. Database Verification

```bash
php artisan tinker

# Verify QRSession created
> QRSession::latest()->first()

# Verify AttendanceRecord created
> AttendanceRecord::latest()->first()

# Verify AuditLog created
> AuditLog::where('action', 'attendance_marked')->latest()->first()

# Check file storage
> file_exists(storage_path('app/public/qr-codes'))

exit
```

---

## 5. Check DevTools (Browser)

### **Network Tab**
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Generate QR → Look for:
   - POST /courses/1/qr (200 OK)
   - Response has qr_url
4. Submit attendance → Look for:
   - POST /api/attendance/submit (200 OK)
   - Response has success: true
```

### **Console Tab**
```
1. Open DevTools (F12)
2. Go to "Console" tab
3. No red errors should appear
4. Camera should work without errors
```

---

## 6. Mobile Testing

```bash
# Get your computer IP
ipconfig      # Windows
ifconfig      # Mac/Linux

# Start server accessible on network
php artisan serve --host=0.0.0.0

# On mobile phone (same network)
Visit: http://{YOUR_IP}:8000

# Test:
- Login works
- Dashboard displays
- Camera access works
- Scanner UI responsive
- Buttons accessible (44px+)
```

---

## Quick Checklist

```
Admin:
☐ Login as admin@test.com
☐ Dashboard shows stats
☐ Search/filter users works
☐ View courses

Teacher:
☐ Login as teacher@test.com
☐ Generate QR code
☐ QR image displays (real file)
☐ Timer counts down
☐ Refresh works

Student:
☐ Login as student@test.com
☐ Click "Scan Attendance"
☐ Grant camera permission
☐ Camera preview shows
☐ Point at QR
☐ QR detects (1-2 sec)
☐ Success message shows
☐ Attendance recorded

Validation:
☐ 30 seconds later, old QR fails
☐ Try to scan same QR twice → error
☐ Enroll different student → scan succeeds

Database:
☐ AttendanceRecord exists
☐ QRSession has attendance_count
☐ AuditLog has entry
```

---

## Troubleshooting

### Camera Not Working?
```
☐ Check browser permissions
☐ Check HTTPS (required in production, not needed locally)
☐ Try different browser
☐ Check device has camera
☐ Try incognito mode
```

### QR Not Detected?
```
☐ Ensure good lighting
☐ Keep QR at arm's length
☐ Hold camera steady
☐ Make QR visible in frame
☐ Try different angle
```

### Attendance Not Recording?
```
☐ Check student is enrolled in course
☐ Verify QR not expired
☐ Run: php artisan tinker
☐ Check: AttendanceRecord::latest()->first()
☐ Check console for errors (F12)
```

### QR Image Shows 404?
```
php artisan storage:link
chmod -R 755 storage/app/public
```

---

## Next Steps

1. ✅ Setup complete (5 min)
2. ✅ Create test users (2 min)
3. ✅ Test admin dashboard (3 min)
4. ✅ Test teacher QR generation (2 min)
5. ✅ Test student QR scanning (5 min)
6. ✅ Test duplicate prevention (2 min)
7. ✅ Test expiration (30 sec wait)
8. ✅ Verify database (1 min)
9. ✅ Check DevTools (1 min)

**Total Time: ~15-20 minutes**

---

## Documentation

After testing, check:
- `TESTING_GUIDE.md` - Full testing documentation
- `QUICK_START.md` - Quick reference
- `DOCUMENTATION_INDEX.md` - All docs
- `COMPLETE_SYSTEM_INTEGRATION.md` - Full system
