import React from "react";

interface CaseFileIconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

export const CaseFileIcon = ({
  size = 24,
  color = "currentColor",
  className,
}: CaseFileIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ color }}
  >
    {/* File body */}
    <rect
      x="5"
      y="3"
      width="14"
      height="18"
      rx="2"
      fill="currentColor"
      fillOpacity="0.06"
      stroke="currentColor"
      strokeWidth="1.2"
    />

    {/* Folded corner */}
    <path
      d="M15 3V7H19"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />

    {/* Header divider */}
    <line
      x1="7"
      y1="9"
      x2="17"
      y2="9"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.6"
    />

    {/* Case bullet points */}
    <circle cx="8" cy="12" r="0.9" fill="currentColor" />
    <circle cx="8" cy="15" r="0.9" fill="currentColor" />
    <circle cx="8" cy="18" r="0.9" fill="currentColor" />

    {/* Text lines */}
    <line
      x1="10"
      y1="12"
      x2="16"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.7"
    />
    <line
      x1="10"
      y1="15"
      x2="16"
      y2="15"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.7"
    />
    <line
      x1="10"
      y1="18"
      x2="14"
      y2="18"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.7"
    />

    {/* Redacted strip */}
    <rect
      x="11"
      y="5.5"
      width="5"
      height="1.6"
      rx="0.4"
      fill="currentColor"
      fillOpacity="0.25"
    />
  </svg>
);
