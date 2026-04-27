import React from "react";
import { cn } from "@/lib/utils/utils";
import FileTree from "../file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import Image from "next/image";

interface TextEditorSidebarProps {
  projectName: string;
  nodes: FsNodeTreeResponse[];
  projectId: string;
  /** Base path for file links, e.g. "text-editor" or "knowledge-graph". Default "text-editor". */
  fileLinkBasePath?: string;
  solidBackground?: boolean;
}

export default function TextEditorSidebar({
  projectName,
  nodes,
  projectId,
  fileLinkBasePath = "text-editor",
  solidBackground = false,
}: TextEditorSidebarProps) {
  return (
    <aside
      className={cn(
        "m-3 flex h-full w-80 flex-col overflow-hidden rounded-2xl border border-border/70 shadow-sm transition-all duration-300",
        solidBackground ? "bg-sidebar backdrop-blur-sm" : "bg-sidebar backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "border-b border-border/70 px-4 py-3 bg-sidebar-primary-foreground",
          // solidBackground ? "bg-background" : "bg-background/",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/quill-writing.png" alt="Quill Writing" width={70} height={100} />
            <h1 className="truncate text-lg font-semibold text-foreground">
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
