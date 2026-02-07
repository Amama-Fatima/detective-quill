"use client";

import { Button } from "@/components/ui/button";
import { FsNodeTreeResponse, FsNode } from "@detective-quill/shared-types";
import {
  MoreHorizontal,
  File as FileIcon,
  Edit,
  FolderX,
  Trash2,
} from "lucide-react";
import { TreeViewElement } from "@/lib/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
import { File, Folder as TreeFolder } from "../../magicui/file-tree";
import { findNodeById } from "@/lib/utils/file-tree-utils";

const TreeItem = ({
  element,
  selectedNodeId,
  onNodeSelect,
  onRenameNode,
  onMoveNode,
  onDeleteNode,
  nodes,
  hoveredFolder,
  setHoveredFolder,
  isOwner,
  isActive,
}: {
  element: TreeViewElement;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
  onRenameNode: (node: FsNode) => void;
  onMoveNode: (node: FsNode) => void;
  onDeleteNode: (node: FsNode) => void;
  nodes: FsNodeTreeResponse[];
  hoveredFolder: string | null;
  setHoveredFolder: (id: string | null) => void;
  isOwner: boolean;
  isActive: boolean;
}) => {
  const node = findNodeById(nodes, element.id);
  const isSelected = selectedNodeId === element.id;
  const isHovered = hoveredFolder === element.id;

  if (element.isSelectable === false) {
    // This is a folder
    return (
      <div
        className="relative group"
        onMouseEnter={() => setHoveredFolder(element.id)}
        onMouseLeave={() => setHoveredFolder(null)}
      >
        <TreeFolder
          value={element.id}
          element={element.name}
          className="px-2 py-1"
        >
          {element.children?.map((child) => (
            <TreeItem
              key={child.id}
              element={child}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onDeleteNode={onDeleteNode}
              nodes={nodes}
              hoveredFolder={hoveredFolder}
              setHoveredFolder={setHoveredFolder}
              isOwner={isOwner}
              isActive={isActive}
            />
          ))}
        </TreeFolder>

        {/* Context Menu */}
        <div
          className={cn(
            "absolute top-1 right-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 cursor-pointer"
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
                onClick={() => node && onRenameNode(node as FsNode)}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNode)}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => onDeleteNode(node as FsNode)}
                disabled={!isOwner || !isActive}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  } else {
    // This is a file
    return (
      <File
        value={element.id}
        isSelect={isSelected}
        handleSelect={onNodeSelect}
        className={cn(
          "px-2 py-1 group flex items-center justify-between",
          isSelected && "bg-primary/10 text-primary",
        )}
        fileIcon={<FileIcon className="h-4 w-4" />}
        asChild
      >
        <div
          onClick={() => onNodeSelect(element.id)}
          className="flex items-center justify-between w-full cursor-pointer"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileIcon className="h-4 w-4" />
            <span className="truncate">{element.name}</span>
            {node?.word_count && node.word_count > 0 && (
              <span className="text-xs text-muted-foreground">
                {node.word_count} words
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
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
                onClick={() => node && onRenameNode(node as FsNode)}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNode)}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => onDeleteNode(node as FsNode)}
                disabled={!isOwner || !isActive}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </File>
    );
  }
};

export default TreeItem;
