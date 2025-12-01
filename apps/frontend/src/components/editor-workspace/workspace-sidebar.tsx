import React from "react";
import { cn } from "@/lib/utils/utils";
import { WorkspaceHeader } from "@/components/editor-workspace/workspace-header";
import { FileTree } from "./file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";

interface WorkspaceSidebarProps {
  projectName: string;
  filesCount: number;
  foldersCount: number;
  nodes: FsNodeTreeResponse[];
  onNodesChange: (nodes: FsNodeTreeResponse[]) => void;
  projectId: string;
  session: any;
  loading: boolean;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = async ({
  projectName,
  filesCount,
  foldersCount,
  nodes,
  onNodesChange,
  projectId,
  session,
  loading,
}) => {
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

  return (
    <aside
      className={cn(
        "w-80 border-r bg-gradient-to-b from-card/50 to-card/30 flex flex-col shadow-sm transition-all duration-300"
      )}
    >
      <WorkspaceHeader
        projectName={projectName}
        filesCount={filesCount}
        foldersCount={foldersCount}
      />
      <FileTree
        nodes={nodes}
        onNodesChange={onNodesChange}
        projectId={projectId}
        projectName={projectName}
        session={session}
        loading={loading}
        isOwner={isOwner}
        isActive={isActive}
      />
    </aside>
  );
};
