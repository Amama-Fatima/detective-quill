"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical } from "lucide-react";
import { RenameChapterDialog } from "./rename-chapter-dialog";
import { ChapterFile } from "./workspace";

interface FileTreeItemProps {
  file: ChapterFile;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

export function FileTreeItem({
  file,
  isSelected,
  onClick,
  onDelete,
  onRename,
}: FileTreeItemProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const handleRename = (newTitle: string) => {
    onRename(newTitle);
    setRenameDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/60 cursor-pointer transition-colors",
          isSelected ? "bg-muted" : "bg-transparent"
        )}
      >
        <div
          className="flex items-center justify-between w-full"
          onClick={onClick}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">
              {file.name.replace(".md", "")}
            </span>
            {file.isDirty && (
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
            )}
            {file.isNew && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RenameChapterDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentTitle={file.name.replace(".md", "")}
        onSubmit={handleRename}
      />
    </>
  );
}
