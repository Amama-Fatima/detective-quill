interface CornerOrnamentIconProps {
  className?: string;
}

export function CornerOrnamentIcon({ className }: CornerOrnamentIconProps) {
  return (
    <svg
      className={className}
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 18C2 9.16344 9.16344 2 18 2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M2 10C2 5.58172 5.58172 2 10 2"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.75"
      />
      <circle cx="18" cy="2" r="1.6" fill="currentColor" />
      <circle cx="10" cy="2" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="2" cy="10" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="2" cy="18" r="1.6" fill="currentColor" />
      <circle
        cx="6.5"
        cy="6.5"
        r="1.1"
        stroke="currentColor"
        strokeWidth="0.9"
      />
      <circle cx="13.5" cy="6.5" r="0.9" fill="currentColor" opacity="0.75" />
      <circle cx="6.5" cy="13.5" r="0.9" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
