import React from "react";
import Breadcrumbs from "./bread-crumbs";
import { Button } from "@/components/ui/button";

interface WorkspaceHeaderBarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName: string;
  nodeId?: string;
  currentNodePath?: string;
}

// todo: everytime the toggle is changed, and the side bar is opened again, the file tree is refetched, we should try to avoid this

export default function WorkspaceHeaderBar({
  sidebarOpen,
  onSidebarToggle,
  projectName,
  nodeId,
  currentNodePath,
}: WorkspaceHeaderBarProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2 bg-card/30">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onSidebarToggle}
          className="p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? "←" : "→"}
        </Button>

        {/* {nodeLoading ? (
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        ) : nodeId && currentNodePath ? (
          <Breadcrumbs projectName={projectName} filePath={currentNodePath} />
        ) : (
          <Breadcrumbs projectName={projectName} />
        )} */}
      </div>
    </div>
  );
}
