export const BriefcaseIcon = () => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="none"
    className="text-primary"
  >
    {/* Briefcase body */}
    <rect
      x="3.5"
      y="8"
      width="17"
      height="11"
      rx="2.5"
      fill="currentColor"
      fillOpacity="0.06"
      stroke="currentColor"
      strokeWidth="1.2"
    />

    {/* Handle base (clear separation) */}
    <path
      d="M9 8V6.8C9 5.8 9.8 5 10.8 5H13.2C14.2 5 15 5.8 15 6.8V8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Lid divider */}
    <line
      x1="3.5"
      y1="12"
      x2="20.5"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Center clasp */}
    <rect
      x="10.7"
      y="11"
      width="2.6"
      height="3.2"
      rx="0.6"
      fill="currentColor"
      fillOpacity="0.25"
    />

    {/* Subtle inner highlight (depth) */}
    <line
      x1="6"
      y1="15.5"
      x2="18"
      y2="15.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.25"
    />
  </svg>
);