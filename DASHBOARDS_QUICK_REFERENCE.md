# Dashboard UI - Quick Reference Guide

## 🎨 Component Usage Examples

### StatCard
```jsx
<StatCard
  label="Total Users"
  value={150}
  change={+12}
  variant="blue"
  icon={(props) => <UserIcon {...props} />}
/>
```
**Variants**: blue, green, indigo, purple

---

### CourseCard
```jsx
<CourseCard
  course={{
    code: "CS101",
    name: "Intro to Computer Science",
    teacher: "Dr. Smith",
    attendance: { attendance_rate: 85 },
    activeEnrollments: [...]
  }}
  actions={[
    { label: 'Generate QR', href: '/courses/1/generate-qr' },
    { label: 'Attendance', href: '/courses/1/attendance' }
  ]}
/>
```

---

### EmptyState
```jsx
<EmptyState
  title="No Courses Yet"
  message="You haven't created any courses."
  icon={BookIcon}
  action={{ label: 'Create Course', onClick: handleCreate }}
/>
```

---

### LoadingSpinner
```jsx
<LoadingSpinner size="md" text="Loading attendance..." />
```
**Sizes**: sm, md, lg

---

## 📱 Layout Breakdown

### Mobile (< 640px)
```
┌─────────────────────────┐
│        Top Nav          │ (hamburger menu, logo, profile)
├─────────────────────────┤
│      Stat Card 1        │
├─────────────────────────┤
│      Stat Card 2        │
├─────────────────────────┤
│      Stat Card 3        │
├─────────────────────────┤
│    Course Card 1        │
├─────────────────────────┤
│    Course Card 2        │
└─────────────────────────┘
```

### Tablet (640px - 1024px)
```
┌─────────────────────────────────────────┐
│           Top Navigation                 │
├─────────────────────────────────────────┤
│  Sidebar     │    Stat Card 1   Stat 2   │
│  ───────     │    Stat Card 3   Stat 4   │
│  Dashboard   │                            │
│  Users       │    Course Card 1  Card 2   │
│  Courses     │    Course Card 3  Card 4   │
│              │                            │
│              │    Course Card 5  Card 6   │
└─────────────────────────────────────────┘
```

### Desktop (1024px+)
```
┌────────────────────────────────────────────────────┐
│              Top Navigation                         │
├──────────────┬─────────────────────────────────────┤
│ Sidebar      │    Stat Card 1   Stat 2  Stat 3    │
│ ──────────   │    Stat Card 4   Stat 5             │
│ Dashboard    │                                      │
│ Users        │    Course Card 1  Card 2  Card 3    │
│ Courses      │    Course Card 4  Card 5  Card 6    │
│              │    Course Card 7  Card 8  Card 9    │
└──────────────┴─────────────────────────────────────┘
```

---

## 🎯 Dashboard Routes

### Admin Dashboard
```
/admin/dashboard        → System overview with stats
/admin/users           → User management table
/admin/courses         → Course management table
```

### Teacher Dashboard
```
/teacher/dashboard     → Teaching overview
/teacher/courses       → Course list
/courses/{id}/generate-qr → QR code generation
/courses/{id}/attendance  → Attendance report
```

### Student Dashboard
```
/student/dashboard     → Student overview
/student/courses       → Enrolled courses
/student/scanner       → QR scanner (not shown in mockups)
/student/attendance-history → Attendance records table
```

---

## 🎨 Color Usage

### Admin Dashboard
```
Primary: indigo-600 (actions)
Background: indigo-50 (accents)
Success: green-600 (positive)
Status: red-600 (warnings)
```

### Teacher Dashboard
```
Primary: green-600 (actions)
Background: green-50 (accents)
Success: blue-600 (info)
Status: orange-600 (alerts)
```

### Student Dashboard
```
Primary: blue-600 (actions)
Background: blue-50 (accents)
Success: green-600 (positive)
Status: red-600 (absent)
```

---

## 📊 Data Flow

```
Controller (Laravel)
    ↓
Props (Inertia)
    ↓
Dashboard Page (JSX)
    ↓
Reusable Components (StatCard, CourseCard, etc.)
    ↓
Rendered UI
```

### Example: Admin Dashboard Data Flow
```php
// AdminController.php
return Inertia::render('Admin/Dashboard', [
    'stats' => [
        'total_users' => 150,
        'total_teachers' => 12,
        'total_students' => 138,
        'total_courses' => 8,
        'total_attendance' => 4200
    ]
]);
```

```jsx
// Admin/Dashboard.jsx
export default function AdminDashboard({ auth, stats }) {
    return (
        <StatCard label="Total Users" value={stats.total_users} />
    );
}
```

---

## 🔄 State Management

### Local State (useState)
```jsx
// Filters
const [searchTerm, setSearchTerm] = useState('');
const [roleFilter, setRoleFilter] = useState('all');

// Modal/Menu
const [sidebarOpen, setSidebarOpen] = useState(false);

// Timers
const [timeRemaining, setTimeRemaining] = useState(30);
```

### Form State (useForm)
```jsx
const { post, processing } = useForm();

const handleSubmit = () => {
    post('/courses', {
        onSuccess: () => console.log('Created!')
    });
};
```

---

## 📱 Mobile Considerations

### Touch Targets
- Minimum 44px × 44px for buttons
- 24px padding for interactive elements
- Generous spacing between elements

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Mobile Menu
- Hamburger icon on left
- Slides in from left on mobile
- Overlay backdrop behind menu
- Touch-friendly nav items

---

## 🎯 Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in dropdowns (optional)

### Screen Readers
- Proper semantic HTML (buttons, links, tables)
- alt text for images
- ARIA labels for custom components
- Headings with proper hierarchy

### Color Contrast
- All text meets WCAG AA standards
- Status indicators have text + color
- Not relying on color alone

---

## 🚀 Performance Tips

### Component Optimization
```jsx
// Memoize static components
const AdminLayout = memo(({ children }) => {...});

// useCallback for callbacks
const handleFilter = useCallback(() => {...}, []);
```

### Lazy Loading
```jsx
// Split components
const Charts = lazy(() => import('./Charts'));
```

### Image Optimization
```jsx
// Use WebP with fallback
<img src="course.webp" srcSet="course.jpg" />
```

---

## 🐛 Common Issues & Solutions

### Issue: Sidebar not showing on mobile
**Solution**: Check if `lg:` breakpoint class is applied correctly

### Issue: Cards wrapping incorrectly
**Solution**: Verify grid-cols classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Issue: Buttons not clickable
**Solution**: Check z-index on overlays, ensure button is not behind other elements

### Issue: Table overflow on mobile
**Solution**: Use `overflow-x-auto` wrapper for table

---

## ✨ Customization

### Changing Colors
1. Replace color classes globally (find/replace)
2. Update Tailwind config for custom colors
3. Example: Change `indigo-600` → `blue-600` for different primary

### Changing Icons
1. Replace inline SVG icons
2. Use icon library (Heroicons, FontAwesome)
3. Example:
   ```jsx
   import { UsersIcon } from '@heroicons/react/24/solid';
   <UsersIcon className="w-6 h-6" />
   ```

### Adding New Stat Card Variant
```jsx
// Add to StatCard.jsx
const variantStyles = {
    // ... existing
    gold: 'bg-yellow-50 border-yellow-200',
};
```

---

## 📞 Support Information

### Documentation
- See DASHBOARDS_COMPLETE.md for full details
- See ARCHITECTURE_INDEX.md for system overview
- See ROLE_BASED_AUTH_GUIDE.md for auth setup

### Component Files
- `resources/js/Components/*.jsx`
- `resources/js/Pages/Admin/*.jsx`
- `resources/js/Pages/Teacher/*.jsx`
- `resources/js/Pages/Student/*.jsx`

### Backend Integration
- Connect controllers to return proper data
- Implement pagination
- Add error handling
- Set up real-time updates (optional)

---

**Version**: 1.0  
**Last Updated**: 2026-04-25  
**Status**: Production Ready ✅
