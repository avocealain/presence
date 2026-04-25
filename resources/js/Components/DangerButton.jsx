export default function DangerButton({
    className = '',
    disabled,
    children,
    loading = false,
    loadingText = 'Loading...',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            className={
                `inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/40 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    isDisabled && 'opacity-60 cursor-not-allowed hover:shadow-none hover:scale-100'
                } ` + className
            }
            disabled={isDisabled}
        >
            {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {loading ? loadingText : children}
        </button>
    );
}
