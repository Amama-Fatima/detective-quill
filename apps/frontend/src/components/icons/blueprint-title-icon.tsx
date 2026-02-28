import React from "react";

interface IconProps {
  className?: string;
}

export const BlueprintTitleIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* page outline */}
    <rect x="4" y="3" width="16" height="18" rx="2.5" />

    {/* title line */}
    <path d="M8 8h8" />

    {/* blueprint content lines */}
    <path d="M8 12h6" opacity="0.8" />
    <path d="M8 15h4" opacity="0.6" />

    {/* subtle blueprint corner fold */}
    <path d="M16 3v4h4" opacity="0.5" />
  </svg>
);
