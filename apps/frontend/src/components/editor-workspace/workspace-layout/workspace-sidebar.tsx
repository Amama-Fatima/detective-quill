import React from "react";
import { cn } from "@/lib/utils/utils";
import FileTree from "../file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { FolderTree } from "lucide-react";

interface WorkspaceSidebarProps {
  projectName: string;
  nodes: FsNodeTreeResponse[];
  projectId: string;
  isOwner: boolean;
  isActive: boolean;
}

export default function WorkspaceSidebar({
  projectName,
  nodes,
  projectId,
  isOwner,
  isActive,
}: WorkspaceSidebarProps) {
  return (
    <aside
      className={cn(
        "w-80 border-r bg-gradient-to-b from-card/50 to-card/30 flex flex-col shadow-sm transition-all duration-300",
      )}
    >
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            <h1 className="mystery-title text-lg font-semibold">
              {projectName}
            </h1>
          </div>
        </div>
      </div>
      <FileTree
        initialNodes={nodes}
        projectId={projectId}
        isOwner={isOwner}
        isActive={isActive}
      />
    </aside>
  );
}
