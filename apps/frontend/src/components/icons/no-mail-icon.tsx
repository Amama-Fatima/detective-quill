export const NoMailIcon = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="text-primary/70"
  >
    {/* Envelope body */}
    <rect
      x="3.5"
      y="6.5"
      width="17"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeOpacity="0.4"
    />

    {/* Envelope flap */}
    <path
      d="M3.5 9L12 14.5L20.5 9"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.4"
    />

    {/* Strike-through — full diagonal, clean caps, stronger presence */}
    <line
      x1="5"
      y1="19"
      x2="19"
      y2="5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Small circles flanking the strike endpoints — ornament language */}
    <circle cx="4.2" cy="19.8" r="1" fill="currentColor" fillOpacity="0.25" />
    <circle cx="19.8" cy="4.2" r="1" fill="currentColor" fillOpacity="0.25" />
  </svg>
);
