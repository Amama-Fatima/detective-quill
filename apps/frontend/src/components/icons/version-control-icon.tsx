export const VersionControlIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    className={`text-primary ${className}`}
  >
    <g>
      {/* Main vertical trunk */}
      <line
        x1="7"
        y1="3"
        x2="7"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Branch curve sweeping right */}
      <path
        d="M7 7 C7 10 13 10 13 13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.7"
      />

      {/* Commit node — top, dynamic accent */}
      <circle
        cx="7"
        cy="4.5"
        r="2"
        fill="oklch(72% 0.18 245)"
        fillOpacity="0.15"
        stroke="oklch(72% 0.18 245)"
        strokeWidth="1.2"
      />

      {/* Commit node — bottom trunk */}
      <circle
        cx="7"
        cy="15.5"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />

      {/* Commit node — branch tip */}
      <circle
        cx="13"
        cy="13"
        r="2"
        fill="oklch(72% 0.18 245)"
        fillOpacity="0.12"
        stroke="oklch(72% 0.18 245)"
        strokeWidth="1.1"
        strokeOpacity="0.8"
      />

      {/* Inner accent dot on top commit — ornament language */}
      <circle
        cx="7"
        cy="4.5"
        r="0.8"
        fill="oklch(72% 0.18 245)"
        fillOpacity="0.6"
      />

      {/* Inner accent dot on branch commit */}
      <circle
        cx="13"
        cy="13"
        r="0.8"
        fill="oklch(72% 0.18 245)"
        fillOpacity="0.5"
      />
    </g>
  </svg>
);
