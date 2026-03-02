export const BlueprintIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <rect
      x="3"
      y="3"
      width="22"
      height="22"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 10H25M3 18H25M10 3V25M18 3V25"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.5"
    />
    <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
  </svg>
);