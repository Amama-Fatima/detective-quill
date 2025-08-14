import React from "react";
import { SidebarToggle } from "./side-bar-toggle";
import { Breadcrumbs } from "./bread-crumbs";

interface WorkspaceHeaderBarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName: string;
  nodeId?: string;
  currentNodePath?: string;
  nodeLoading: boolean;
}

export const WorkspaceHeaderBar: React.FC<WorkspaceHeaderBarProps> = ({
  sidebarOpen,
  onSidebarToggle,
  projectName,
  nodeId,
  currentNodePath,
  nodeLoading,
}) => {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2 bg-card/30">
      <div className="flex items-center gap-2">
        <SidebarToggle isOpen={sidebarOpen} onToggle={onSidebarToggle} />

        {nodeLoading ? (
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        ) : nodeId && currentNodePath ? (
          <Breadcrumbs projectName={projectName} filePath={currentNodePath} />
        ) : (
          <Breadcrumbs projectName={projectName} />
        )}
      </div>
    </div>
  );
};
