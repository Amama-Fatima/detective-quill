import React from "react";

interface IconProps {
  className?: string;
}

export const CalendarIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* outer frame */}
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />

    {/* binding rings */}
    <line x1="8" y1="3.5" x2="8" y2="7" />
    <line x1="16" y1="3.5" x2="16" y2="7" />

    {/* header divider */}
    <line x1="3.5" y1="9" x2="20.5" y2="9" opacity="0.7" />

    {/* elegant date markers */}
    <circle cx="8" cy="13" r="0.9" />
    <circle cx="12" cy="13" r="0.9" opacity="0.8" />
    <circle cx="16" cy="13" r="0.9" opacity="0.6" />

    <circle cx="10" cy="16.5" r="0.9" opacity="0.8" />
    <circle cx="14" cy="16.5" r="0.9" opacity="0.6" />
  </svg>
);
