export function TravelDiaryIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="td-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#td-bg)" />
      <circle cx="16" cy="18" r="9" fill="none" stroke="white" strokeWidth="1.4" opacity="0.9" />
      <ellipse cx="16" cy="18" rx="4.5" ry="9" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <line x1="7" y1="18" x2="25" y2="18" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <path d="M 8.5 13 Q 16 11 23.5 13" fill="none" stroke="white" strokeWidth="1.1" opacity="0.6" />
      <circle cx="16" cy="8" r="3.5" fill="#facc15" stroke="white" strokeWidth="1" />
      <path d="M 16 11.5 L 16 15" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="8" r="1.3" fill="white" />
    </svg>
  );
}
