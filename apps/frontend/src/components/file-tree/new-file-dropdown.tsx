"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, FolderPlus, Plus } from "lucide-react";

interface NewFileDropdownProps {
  disabled?: boolean;
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

export default function NewFileDropdown({
  disabled,
  onCreateFile,
  onCreateFolder,
}: NewFileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="flex-1 gap-2 cursor-pointer"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={onCreateFile}
          className="cursor-pointer"
          disabled={disabled}
        >
          <FileText className="h-4 w-4 mr-2" />
          New File
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCreateFolder}
          className="cursor-pointer"
          disabled={disabled}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
