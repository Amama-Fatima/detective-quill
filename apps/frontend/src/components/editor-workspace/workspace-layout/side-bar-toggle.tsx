import React from "react";
import { Button } from "../../ui/button";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarToggle({
  isOpen,
  onToggle,
}: SidebarToggleProps) {
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
}
