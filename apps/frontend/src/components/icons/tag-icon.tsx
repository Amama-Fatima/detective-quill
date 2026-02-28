export const TagIcon = ({
  size = 22,
  className = "",
  accentColor = "oklch(72% 0.18 145)",
}) => (
  <svg
    width={size}
    height={(size * 28) / 22}
    viewBox="0 0 22 28"
    fill="none"
    className={`text-primary ${className}`}
  >
    <g transform="rotate(-30, 11, 14)">
      {/* String / attachment stub — fixed, uses currentColor */}
      <path
        d="M11 2 C11 2 9 4 9 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      {/* Tag body — dynamic color */}
      <path
        d="M4 6 Q4 4 6 4 H16 Q18 4 18 6 L18 19 Q18 21 16 22 L11 26 L6 22 Q4 21 4 19 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Hole */}
      <circle
        cx="11"
        cy="7.5"
        r="1.5"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Label lines — fixed, currentColor */}
      <line
        x1="7"
        y1="13"
        x2="15"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <line
        x1="7.5"
        y1="16.5"
        x2="14.5"
        y2="16.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      <line
        x1="8.5"
        y1="20"
        x2="13.5"
        y2="20"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />

      {/* Pointed bottom tip accent dot — dynamic */}
      <circle cx="11" cy="25.2" r="0.8" fill={accentColor} fillOpacity="0.9" />
    </g>
  </svg>
);
