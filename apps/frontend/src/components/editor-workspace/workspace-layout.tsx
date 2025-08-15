import React from "react";
import { WorkspaceError } from "./workspace-error";
import { getEditorWorkspaceData } from "@/lib/server/editor-workspace";
import { WorkspaceLayoutClientWrapper } from "./workspace-layout-client-wrapper";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectId: string;
  nodeId?: string;
}

export async function WorkspaceLayout({
  children,
  projectId,
  nodeId,
}: WorkspaceLayoutProps) {
  try {
    const { project, nodes, currentNode, user } = await getEditorWorkspaceData(
      projectId,
      nodeId
    );

    return (
      <WorkspaceLayoutClientWrapper
        project={project}
        initialNodes={nodes}
        currentNode={currentNode}
        projectId={projectId}
        nodeId={nodeId}
      >
        {children}
      </WorkspaceLayoutClientWrapper>
    );
  } catch (error) {
    console.error("Workspace layout error:", error);
    return (
      <WorkspaceError
        error={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}
