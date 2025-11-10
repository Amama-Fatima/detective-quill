import { FolderTree, FilePlus, FileText } from "lucide-react";

interface WorkspaceHeaderProps {
  projectName: string;
  filesCount: number;
  foldersCount: number;
}

export function WorkspaceHeader({
  projectName,
  filesCount,
  foldersCount,
}: WorkspaceHeaderProps) {
  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderTree className="h-5 w-5 text-primary" />
          <h1 className="mystery-title text-lg font-semibold">{projectName}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Files</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {filesCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Folders</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {foldersCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
