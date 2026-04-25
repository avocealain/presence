# Quick Reference: Using New UX Components

## 🔔 Toast Notifications

### Import
```javascript
import { useToast } from '@/Components/ToastContext';
```

### Usage
```javascript
const MyComponent = () => {
    const toast = useToast();
    
    // Success
    toast.success('✓ Action completed successfully!');
    
    // Error
    toast.error('❌ Something went wrong');
    
    // Info
    toast.info('ℹ️ Just so you know...');
    
    // Warning
    toast.warning('⚠️ Be careful about this');
    
    // Generic (auto-dismisses after 5 seconds)
    toast.show('Message', 'info');
    
    return <div>...</div>;
};
```

---

## 🔘 Enhanced Buttons with Loading

### Import
```javascript
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
```

### Usage
```javascript
const MyComponent = () => {
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        setLoading(true);
        try {
            // API call here
            await someAsyncOperation();
            toast.success('Done!');
        } catch (error) {
            toast.error('Failed!');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            {/* With Inertia useForm */}
            <PrimaryButton
                loading={processing}
                loadingText="Saving..."
                onClick={submit}
            >
                Save
            </PrimaryButton>
            
            {/* Manual loading state */}
            <PrimaryButton
                loading={loading}
                loadingText="Processing..."
                onClick={handleClick}
            >
                Process
            </PrimaryButton>
            
            {/* Secondary button */}
            <SecondaryButton
                loading={isLoading}
                loadingText="Loading..."
            >
                Action
            </SecondaryButton>
            
            {/* Danger button */}
            <DangerButton
                loading={isDeleting}
                loadingText="Deleting..."
            >
                Delete
            </DangerButton>
        </>
    );
};
```

---

## 💀 Skeleton Loaders

### Import
```javascript
import SkeletonLoader from '@/Components/SkeletonLoader';
```

### Usage
```javascript
const MyComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        // Fetch data
    }, []);
    
    return (
        <>
            {/* Card skeleton */}
            {isLoading ? (
                <SkeletonLoader.Card />
            ) : (
                <Card data={data} />
            )}
            
            {/* Stat card skeleton */}
            {isLoading ? (
                <SkeletonLoader.StatCard />
            ) : (
                <StatCard stat={stat} />
            )}
            
            {/* Grid of skeletons */}
            {isLoading ? (
                <SkeletonLoader.Grid count={3} />
            ) : (
                <CardGrid cards={cards} />
            )}
            
            {/* Table skeleton */}
            {isLoading ? (
                <SkeletonLoader.Table rows={5} columns={4} />
            ) : (
                <DataTable data={data} />
            )}
            
            {/* Text skeleton */}
            {isLoading ? (
                <SkeletonLoader.Text width="w-full" height="h-4" />
            ) : (
                <p>{text}</p>
            )}
        </>
    );
};
```

---

## 🔄 Common Patterns

### API Call with Toast and Loading Button
```javascript
import { useForm } from '@inertiajs/react';
import { useToast } from '@/Components/ToastContext';
import PrimaryButton from '@/Components/PrimaryButton';

const MyComponent = () => {
    const { post, processing } = useForm();
    const toast = useToast();
    
    const handleSubmit = () => {
        toast.info('⏳ Processing...');
        
        post('/api/endpoint', {
            onSuccess: () => {
                toast.success('✓ Completed successfully!');
            },
            onError: (errors) => {
                toast.error('❌ ' + (errors.message || 'Failed'));
            }
        });
    };
    
    return (
        <PrimaryButton
            loading={processing}
            loadingText="Processing..."
            onClick={handleSubmit}
        >
            Submit
        </PrimaryButton>
    );
};
```

### Camera Permission with Toast
```javascript
const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false,
        });
        
        toast.success('📷 Camera started');
        // ... rest of camera logic
    } catch (error) {
        if (error.name === 'NotAllowedError') {
            toast.error('🔒 Camera permission denied');
        } else if (error.name === 'NotFoundError') {
            toast.error('📷 No camera found');
        } else {
            toast.error('❌ ' + error.message);
        }
    }
};
```

### Data Loading with Skeleton
```javascript
const DataComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/data');
                const result = await response.json();
                setData(result);
                toast.success('✓ Data loaded');
            } catch (error) {
                toast.error('❌ Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    return isLoading ? <SkeletonLoader.Grid count={3} /> : <DisplayData data={data} />;
};
```

---

## 🎨 Toast Styling Guide

### Toast Types and Colors
- **Success**: Green (bg-green-50, border-green-200, text-green-800)
- **Error**: Red (bg-red-50, border-red-200, text-red-800)
- **Warning**: Yellow (bg-yellow-50, border-yellow-200, text-yellow-800)
- **Info**: Blue (bg-blue-50, border-blue-200, text-blue-800)

### Icons Used
- Success: ✓ Checkmark
- Error: ✕ X mark
- Warning: ⚠️ Triangle
- Info: ℹ️ Information

---

## 📱 Mobile Considerations

- All buttons have 48px+ height (touch-friendly)
- Toast positioned at top-right (safe for mobile)
- Skeleton loaders responsive on all screen sizes
- Spinner icons scale appropriately
- No horizontal scrolling needed

---

## ✅ Best Practices

1. **Always show loading state** during async operations
2. **Always show toast** on success or error
3. **Use descriptive loading text** ("Saving...", "Generating...", etc.)
4. **Disable form inputs** during submission (buttons do this automatically)
5. **Show error details** in toast messages
6. **Use skeleton** for anticipated content
7. **Keep toast messages concise** (one line preferred)
8. **Use icons in toasts** for quick visual scanning

---

## 🔗 File Locations

| Component | Path |
|-----------|------|
| Toast | `resources/js/Components/Toast.jsx` |
| ToastContext | `resources/js/Components/ToastContext.jsx` |
| SkeletonLoader | `resources/js/Components/SkeletonLoader.jsx` |
| PrimaryButton | `resources/js/Components/PrimaryButton.jsx` |
| SecondaryButton | `resources/js/Components/SecondaryButton.jsx` |
| DangerButton | `resources/js/Components/DangerButton.jsx` |

---

## 🐛 Troubleshooting

### Toast not showing?
- Ensure app is wrapped with `<ToastProvider>` in `app.jsx`
- Check console for errors
- Verify `useToast()` hook is imported

### Loading spinner not animating?
- Check if `loading` prop is boolean
- Verify Tailwind CSS is loading (check devtools styles)
- Try browser refresh

### Skeleton not visible?
- Ensure `isLoading` state is `true`
- Check if SkeletonLoader variant exists
- Verify component is rendering before data

---

## 📞 Support

For issues or questions about these components, check:
1. `UX_IMPROVEMENTS_SUMMARY.md` - Implementation details
2. Example usage in updated pages (Scanner, GenerateQR, Login, Register)
3. Component source code for prop definitions

