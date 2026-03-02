export const GitBranchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Main vertical path */}
    <path
      d="M8 5V14"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Branch connection */}
    <path
      d="M8 10C8 10 10 10 12 10C14 10 16 11 16 13"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Nodes */}
    <circle cx="8" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="8" cy="14" r="1.6" fill="currentColor" fillOpacity="0.25" />
    <circle cx="16" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" />

    {/* Decorative baseline */}
    <line
      x1="4"
      y1="20"
      x2="20"
      y2="20"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.35"
    />

    <circle
      cx="12"
      cy="20"
      r="1.3"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeOpacity="0.5"
    />
  </svg>
);
