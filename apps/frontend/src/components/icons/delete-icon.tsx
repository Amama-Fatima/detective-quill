export const DeleteIcon = ({ size = 24, className="!size-7" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className} shrink-0 text-primary`}
  >
    {/* Lid */}
    <path
      d="M6 7.5H18"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Handle */}
    <path
      d="M10 5.8H14"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Bin body (taller) */}
    <rect
      x="7.5"
      y="7.5"
      width="9"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.3"
    />

    {/* Inner paper lines */}
    <line
      x1="10"
      y1="10"
      x2="10"
      y2="16.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeOpacity="0.65"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="10"
      x2="14"
      y2="16.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeOpacity="0.65"
      strokeLinecap="round"
    />

  </svg>
);
