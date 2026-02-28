import React from "react";

interface IconProps {
  className?: string;
}

export const EditIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Pencil body */}
    <path d="M4 20l3.5-.7L19 7.8a2 2 0 0 0 0-2.8l-.9-.9a2 2 0 0 0-2.8 0L3.8 15.6 3 19.5 4 20z" />

    {/* Pencil tip detail */}
    <path d="M13.5 6.5l4 4" />

    {/* subtle baseline for elegance */}
    <path d="M3 21h18" opacity="0.35" />
  </svg>
);