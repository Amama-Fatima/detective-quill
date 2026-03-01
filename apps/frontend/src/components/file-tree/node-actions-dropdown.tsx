"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FsNode } from "@detective-quill/shared-types";
import { MoreHorizontal, FolderX } from "lucide-react";
import { DeleteIcon } from "../icons/delete-icon";
import { EditIcon } from "../icons/edit-icon";

interface NodeActionsDropdownProps {
  node: FsNode | null;
  isOwner: boolean;
  isActive: boolean;
  onRenameNode: (node: FsNode) => void;
  onMoveNode: (node: FsNode) => void;
  onDeleteNode: (node: FsNode) => void;
  triggerClassName?: string;
  moveIconClassName?: string;
  deleteIconClassName?: string;
  deleteLabel?: string;
}

export default function NodeActionsDropdown({
  node,
  isOwner,
  isActive,
  onRenameNode,
  onMoveNode,
  onDeleteNode,
  triggerClassName = "h-5 w-5 shrink-0 cursor-pointer",
  moveIconClassName = "h-4 w-4 mr-2",
  deleteIconClassName = "size-5!",
}: NodeActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={triggerClassName}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          disabled={!isOwner || !isActive}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => node && onRenameNode(node)}
          className="cursor-pointer"
          disabled={!isOwner || !isActive}
        >
          <EditIcon className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => node && onMoveNode(node)}
          className="cursor-pointer"
          disabled={!isOwner || !isActive}
        >
          <FolderX className={moveIconClassName} />
          Move
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive cursor-pointer"
          onClick={() => node && onDeleteNode(node)}
          disabled={!isOwner || !isActive}
        >
          <DeleteIcon className={deleteIconClassName} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
