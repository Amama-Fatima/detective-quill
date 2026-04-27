export const EnvelopeIcon = ({
    faded = false,
}) =>  (
    <svg
      width="28"
      height="20"
      viewBox="0 0 28 20"
      fill="none"
      aria-hidden
      className={`shrink-0 text-muted-foreground ${faded ? "opacity-20" : "opacity-50"}`}
    >
      <rect
        x="0.75"
        y="0.75"
        width="26.5"
        height="18.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="0.75,0.75 14,11 27.25,0.75"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
