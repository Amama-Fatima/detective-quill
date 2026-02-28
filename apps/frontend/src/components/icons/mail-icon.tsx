export const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect
      x="2"
      y="4"
      width="16"
      height="12"
      rx="1.5"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
    />
    <polyline
      points="2,5 10,11 18,5"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const MembersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    {/* Primary user */}
    <circle
      cx="8"
      cy="7"
      r="3"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
    />
    <path
      d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Secondary user (offset) */}
    <circle
      cx="14"
      cy="7"
      r="2.5"
      stroke="oklch(82% 0.018 245)"
      strokeWidth="1"
    />
    <path
      d="M12 17c.5-1.8 1.8-3 4-3s3.5 1.2 4 3"
      stroke="oklch(82% 0.018 245)"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

export const GitBranchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    {/* Main branch line */}
    <line
      x1="6"
      y1="4"
      x2="6"
      y2="16"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Branch curve */}
    <path
      d="M6 7 Q6 10 12 10"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Commit nodes */}
    <circle
      cx="6"
      cy="5"
      r="2"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
    />
    <circle
      cx="6"
      cy="15"
      r="2"
      stroke="oklch(50% 0.018 240)"
      strokeWidth="1.2"
    />
    <circle
      cx="14"
      cy="10"
      r="2"
      stroke="oklch(82% 0.018 245)"
      strokeWidth="1"
    />
    {/* Small accent dot echoing the ornament */}
    <circle cx="14" cy="10" r="0.8" fill="oklch(82% 0.018 245)" />
  </svg>
);