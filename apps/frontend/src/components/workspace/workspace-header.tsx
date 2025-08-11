"use client";

import { Button } from "@/components/ui/button";
import { FolderTree, FilePlus, FileText } from "lucide-react";

interface WorkspaceHeaderProps {
  projectName: string;
  filesCount: number;
  onCreateFile: () => void;
}

export function WorkspaceHeader({
  projectName,
  filesCount,
  onCreateFile,
}: WorkspaceHeaderProps) {
  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{projectName}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Chapters</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {filesCount}
          </span>
        </div>

        <Button size="sm" onClick={onCreateFile} className="gap-2">
          <FilePlus className="h-4 w-4" />
          New
        </Button>
      </div>
    </div>
  );
}
