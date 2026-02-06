"use client";

import React, { useState } from "react";
import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import WorkspaceSidebar from "@/components/editor-workspace/workspace-layout/workspace-sidebar";
import WorkspaceHeaderBar from "@/components/editor-workspace/workspace-layout/workspace-header-bar";
import { countNodes } from "@/lib/utils/file-tree-utils";
import {
  FsNodeTreeResponse,
  FsNode,
  Project,
} from "@detective-quill/shared-types";

interface WorkspaceLayoutClientWrapperProps {
  children: React.ReactNode;
  project: Project;
  initialNodes: FsNodeTreeResponse[];
  currentNode: FsNode | null;
  projectId: string;
  nodeId?: string;
  isActive: boolean;
  isOwner: boolean;
}

export default function WorkspaceLayoutClientWrapper({
  children,
  project,
  initialNodes,
  currentNode,
  projectId,
  nodeId,
  isActive,
  isOwner,
}: WorkspaceLayoutClientWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nodes, setNodes] = useState<FsNodeTreeResponse[]>(initialNodes);

  const focusMode = useFocusModeStore((state) => state.focusMode);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // todo: these will not be in sync when file ops are performed
  // Computed values
  const { files: filesCount, folders: foldersCount } = React.useMemo(() => {
    return countNodes(nodes);
  }, [nodes]);

  const showSidebar = sidebarOpen && focusMode === "NORMAL";
  const showHeader = focusMode === "NORMAL";

  return (
    <div className="flex h-screen w-full bg-background">
      {showSidebar && (
        <WorkspaceSidebar
          projectName={project.title}
          nodes={nodes}
          projectId={projectId}
          isOwner={isOwner}
          isActive={isActive}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {showHeader && (
          <WorkspaceHeaderBar
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
            projectName={project.title}
            nodeId={nodeId}
            currentNodePath={currentNode?.path ?? undefined}
          />
        )}

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
