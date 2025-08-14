import React from "react";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 hover:bg-muted rounded-md transition-colors"
      title={isOpen ? "Hide sidebar" : "Show sidebar"}
    >
      {isOpen ? "←" : "→"}
    </button>
  );
};
