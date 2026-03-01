import React from "react";
import TextEditor from "./text-editor-error";
import { getEditorWorkspaceData } from "@/lib/supabase-calls/editor-workspace";
import TextEditorLayoutWrapper from "./text-editor-layout-wrapper";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/utils/get-user";

interface TextEditorLayoutProps {
  children: React.ReactNode;
  projectId: string;
  nodeId?: string;
}

export default async function TextEditorLayout({
  children,
  projectId,
  nodeId,
}: TextEditorLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  try {
    const { project, nodes, currentNode } = await getEditorWorkspaceData(
      supabase,
      projectId,
      nodeId,
    );

    return (
      <TextEditorLayoutWrapper
        project={project}
        initialNodes={nodes}
        currentNode={currentNode}
        projectId={projectId}
        nodeId={nodeId}
      >
        {children}
      </TextEditorLayoutWrapper>
    );
  } catch (error) {
    console.error("Workspace layout error:", error);
    return (
      <TextEditor
        error={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }
}
