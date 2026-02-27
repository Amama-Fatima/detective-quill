export const BriefcaseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="text-primary"
  >
    {/* Main briefcase body */}
    <rect
      x="4"
      y="8"
      width="16"
      height="10"
      rx="2"
      fill="currentColor"
      fillOpacity="0.06"
      stroke="currentColor"
      strokeWidth="1.2"
    />

    {/* Handle */}
    <rect
      x="9"
      y="5"
      width="6"
      height="3"
      rx="1"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="1.2"
    />

    {/* Divider line for flap */}
    <line
      x1="4"
      y1="11"
      x2="20"
      y2="11"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Lock / clasp */}
    <rect
      x="11"
      y="12.5"
      width="2"
      height="3"
      rx="0.4"
      fill="currentColor"
      fillOpacity="0.25"
    />

    {/* Optional subtle corner accents */}
    <circle cx="5" cy="9" r="0.8" fill="currentColor" fillOpacity="0.3" />
    <circle cx="19" cy="9" r="0.8" fill="currentColor" fillOpacity="0.3" />
  </svg>
);
