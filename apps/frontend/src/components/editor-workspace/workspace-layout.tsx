import React from "react";
import { WorkspaceError } from "./workspace-error";
import { getEditorWorkspaceData } from "@/lib/supabase-calls/editor-workspace";
import { WorkspaceLayoutClientWrapper } from "./workspace-layout-client-wrapper";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";

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
   const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      redirect("/auth/sign-in");
    }
  
    const userId = user.id;
    const { isActive, author_id } = await getProjectStatusAndAuthor(
      projectId,
      supabase
    );
  
    const isOwner = author_id === userId;
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
        isActive={isActive}
        isOwner={isOwner}
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
