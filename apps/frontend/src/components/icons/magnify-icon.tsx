export const MagnifyIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M17 17L24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 11H14M11 8V14"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);