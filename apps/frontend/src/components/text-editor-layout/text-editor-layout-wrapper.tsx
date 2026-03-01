"use client";

import React, { useState } from "react";
import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import TextEditorSidebar from "@/components/text-editor-layout/text-editor-sidebar";
import TextEditorHeaderBar from "@/components/text-editor-layout/text-editor-header-bar";
import { FsNodeTreeResponse, Project } from "@detective-quill/shared-types";

interface TextEditorLayoutWrapperProps {
  children: React.ReactNode;
  project: Project;
  initialNodes: FsNodeTreeResponse[];
  projectId: string;
}

export default function TextEditorLayoutWrapper({
  children,
  project,
  initialNodes,
  projectId,
}: TextEditorLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const focusMode = useFocusModeStore((state) => state.focusMode);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showSidebar = sidebarOpen && focusMode === "NORMAL";
  const showHeader = focusMode === "NORMAL";

  return (
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
          />
        )}

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
