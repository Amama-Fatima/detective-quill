"use client";

import React, { useState } from "react";
import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import TextEditorSidebar from "@/components/text-editor-layout/text-editor-sidebar";
import TextEditorHeaderBar from "@/components/text-editor-layout/text-editor-header-bar";
import { WorkspaceContextProvider } from "@/context/workspace-context";
import {
  FsNodeTreeResponse,
  FsNode,
  Project,
} from "@detective-quill/shared-types";

interface TextEditorLayoutWrapperProps {
  children: React.ReactNode;
  project: Project;
  initialNodes: FsNodeTreeResponse[];
  currentNode: FsNode | null;
  projectId: string;
  nodeId?: string;
  isActive: boolean;
  isOwner: boolean;
  activeBranchId: string | null;
}

export default function TextEditorLayoutWrapper({
  children,
  project,
  initialNodes,
  currentNode,
  projectId,
  nodeId,
  isActive,
  isOwner,
  activeBranchId,
}: TextEditorLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const focusMode = useFocusModeStore((state) => state.focusMode);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showSidebar = sidebarOpen && focusMode === "NORMAL";
  const showHeader = focusMode === "NORMAL";

  return (
    <WorkspaceContextProvider
      projectId={projectId}
      activeBranchId={activeBranchId}
      isOwner={isOwner}
      isActive={isActive}
    >
      <div className="flex h-screen w-full">
        {showSidebar && (
          <TextEditorSidebar
            projectName={project.title}
            nodes={initialNodes}
            projectId={projectId}
          />
        )}

        <main className="flex-1 flex flex-col min-w-0 ">
          {showHeader && (
            <TextEditorHeaderBar
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
    </WorkspaceContextProvider>
  );
}
