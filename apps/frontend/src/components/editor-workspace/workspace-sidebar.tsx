// components/workspace/WorkspaceSidebar.tsx
import React from "react";
import { cn } from "@/lib/utils/utils";
import { WorkspaceHeader } from "@/components/editor-workspace/workspace-header";
import { FileTree } from "./file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";

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

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  projectName,
  filesCount,
  foldersCount,
  nodes,
  onNodesChange,
  projectId,
  session,
  loading,
}) => {
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
      />
    </aside>
  );
};
