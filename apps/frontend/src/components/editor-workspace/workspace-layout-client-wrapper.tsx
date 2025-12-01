"use client";

import React, { useState } from "react";
import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import { WorkspaceSidebar } from "@/components/editor-workspace/workspace-sidebar";
import { WorkspaceHeaderBar } from "@/components/editor-workspace/workspace-header-bar";
import { countNodes } from "@/lib/utils/utils";
import {
  FsNodeTreeResponse,
  FsNode,
  Project,
} from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";

interface WorkspaceLayoutClientWrapperProps {
  children: React.ReactNode;
  project: Project;
  initialNodes: FsNodeTreeResponse[];
  currentNode: FsNode | null;
  projectId: string;
  nodeId?: string;
}

export function WorkspaceLayoutClientWrapper({
  children,
  project,
  initialNodes,
  currentNode,
  projectId,
  nodeId,
}: WorkspaceLayoutClientWrapperProps) {
  // Client-side state for interactive features
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nodes, setNodes] = useState<FsNodeTreeResponse[]>(initialNodes);
  const { session } = useAuth();

  // Global focus mode state
  const focusMode = useFocusModeStore((state) => state.focusMode);

  // Event handlers
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNodesChange = (updatedNodes: FsNodeTreeResponse[]) => {
    setNodes(updatedNodes);
  };

  // Computed values
  const { files: filesCount, folders: foldersCount } = React.useMemo(() => {
    return countNodes(nodes);
  }, [nodes]);

  const showSidebar = sidebarOpen && focusMode === "NORMAL";
  const showHeader = focusMode === "NORMAL";

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <WorkspaceSidebar
          projectName={project.title}
          filesCount={filesCount}
          foldersCount={foldersCount}
          nodes={nodes}
          onNodesChange={handleNodesChange}
          projectId={projectId}
          session={session}
          loading={false}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        {showHeader && (
          <WorkspaceHeaderBar
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
            projectName={project.title}
            nodeId={nodeId}
            currentNodePath={currentNode?.path ?? undefined}
          />
        )}

        {/* Children */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
