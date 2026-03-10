"use client";

import React from "react";
import TextEditorSidebar from "@/components/text-editor-layout/text-editor-sidebar";
import { FsNodeTreeResponse, Project } from "@detective-quill/shared-types";

interface KnowledgeGraphLayoutWrapperProps {
  children: React.ReactNode;
  project: Project;
  initialNodes: FsNodeTreeResponse[];
  projectId: string;
}

export default function KnowledgeGraphLayoutWrapper({
  children,
  project,
  initialNodes,
  projectId,
}: KnowledgeGraphLayoutWrapperProps) {
  return (
    <div className="flex h-full w-full min-h-0">
      <TextEditorSidebar
        projectName={project.title}
        nodes={initialNodes}
        projectId={projectId}
        fileLinkBasePath="knowledge-graph"
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
