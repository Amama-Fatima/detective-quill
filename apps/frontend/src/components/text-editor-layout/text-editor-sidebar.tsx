import React from "react";
import { cn } from "@/lib/utils/utils";
import FileTree from "../file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { FolderTree } from "lucide-react";

interface TextEditorSidebarProps {
  projectName: string;
  nodes: FsNodeTreeResponse[];
  projectId: string;
  /** Base path for file links, e.g. "text-editor" or "knowledge-graph". Default "text-editor". */
  fileLinkBasePath?: string;
}

export default function TextEditorSidebar({
  projectName,
  nodes,
  projectId,
  fileLinkBasePath = "text-editor",
}: TextEditorSidebarProps) {
  return (
    <aside
      className={cn(
        "m-3 flex   h-full w-80 flex-col overflow-hidden rounded-2xl border border-border/70 bg-sidebar shadow-sm transition-all duration-300",
      )}
    >
      <div className="border-b border-border/70 bg-background/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-primary" />
            <h1 className="truncate text-sm font-semibold text-foreground">
              {projectName}
            </h1>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-2">
        <FileTree
          initialNodes={nodes}
          projectId={projectId}
          fileLinkBasePath={fileLinkBasePath}
        />
      </div>
    </aside>
  );
}
