export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="6" y="6" width="52" height="52" rx="12" fill="currentColor" opacity="0.12" />
            <rect x="12" y="12" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="16" y="16" width="6" height="6" rx="1" fill="currentColor" />
            <rect x="38" y="12" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="42" y="16" width="6" height="6" rx="1" fill="currentColor" />
            <rect x="12" y="38" width="14" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="16" y="42" width="6" height="6" rx="1" fill="currentColor" />
            <path d="M33 41L38 46L51 33" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
