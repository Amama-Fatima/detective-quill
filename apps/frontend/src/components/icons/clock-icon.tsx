export const ClockIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="text-primary"
  >
    {/* Outer circle */}
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.06"
    />

    {/* Hour hand */}
    <line
      x1="12"
      y1="12"
      x2="12"
      y2="8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Minute hand */}
    <line
      x1="12"
      y1="12"
      x2="16"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Clock center dot */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />

    {/* Optional hour markers */}
    <circle cx="12" cy="4" r="0.8" fill="currentColor" fillOpacity="0.6" />
    <circle cx="12" cy="20" r="0.8" fill="currentColor" fillOpacity="0.6" />
    <circle cx="4" cy="12" r="0.8" fill="currentColor" fillOpacity="0.6" />
    <circle cx="20" cy="12" r="0.8" fill="currentColor" fillOpacity="0.6" />
  </svg>
);
