import React from "react";
import { Button } from "../ui/button";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
      title={isOpen ? "Hide sidebar" : "Show sidebar"}
    >
      {isOpen ? "←" : "→"}
    </Button>
  );
};
