
export const GraphIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path
      d="M4 22L10 14L15 18L21 8L24 11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="14" r="2" fill="currentColor" />
    <circle cx="15" cy="18" r="2" fill="currentColor" />
    <circle cx="21" cy="8" r="2" fill="currentColor" />
    <path
      d="M4 4V24H24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);