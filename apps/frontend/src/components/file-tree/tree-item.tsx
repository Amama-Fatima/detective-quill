"use client";

import { FsNodeTreeResponse, FsNode } from "@detective-quill/shared-types";
import { TreeViewElement } from "@/lib/types/workspace";
import { cn } from "@/lib/utils/utils";
import { File, Folder as TreeFolder } from "../magicui/file-tree";
import { findNodeById } from "@/lib/utils/file-tree-utils";
import { useWorkspaceContext } from "@/context/workspace-context";
import { CaseFileIcon } from "../icons/case-file-icon";
import NodeActionsDropdown from "./node-actions-dropdown";

const TreeItem = ({
  element,
  selectedNodeId,
  onNodeSelect,
  onNodeHover,
  onRenameNode,
  onMoveNode,
  onDeleteNode,
  nodes,
  hoveredFolder,
  setHoveredFolder,
}: {
  element: TreeViewElement;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string) => void;
  onRenameNode: (node: FsNode) => void;
  onMoveNode: (node: FsNode) => void;
  onDeleteNode: (node: FsNode) => void;
  nodes: FsNodeTreeResponse[];
  hoveredFolder: string | null;
  setHoveredFolder: (id: string | null) => void;
}) => {
  const { isOwner, isActive } = useWorkspaceContext();
  const node = findNodeById(nodes, element.id);
  const isSelected = selectedNodeId === element.id;
  const isHovered = hoveredFolder === element.id;

  if (element.isSelectable === false) {
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
              onNodeHover={onNodeHover}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onDeleteNode={onDeleteNode}
              nodes={nodes}
              hoveredFolder={hoveredFolder}
              setHoveredFolder={setHoveredFolder}
            />
          ))}
        </TreeFolder>

        <div
          className={cn(
            "absolute top-1 right-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          <NodeActionsDropdown
            node={(node as FsNode) ?? null}
            isOwner={isOwner}
            isActive={isActive}
            onRenameNode={onRenameNode}
            onMoveNode={onMoveNode}
            onDeleteNode={onDeleteNode}
          />
        </div>
      </div>
    );
  }

  return (
    <File
      value={element.id}
      isSelect={isSelected}
      handleSelect={onNodeSelect}
      className={cn(
        "px-2 py-1 group flex items-center justify-between",
        isSelected && "bg-primary/10 text-primary",
      )}
      fileIcon={<CaseFileIcon />}
      asChild
    >
      <div
        onMouseEnter={() => onNodeHover(element.id)}
        onClick={() => onNodeSelect(element.id)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CaseFileIcon />
          <span className="truncate">{element.name}</span>
          {node?.word_count && node.word_count > 0 && (
            <span className="text-xs text-muted-foreground">
              {node.word_count} words
            </span>
          )}
        </div>

        <NodeActionsDropdown
          node={(node as FsNode) ?? null}
          isOwner={isOwner}
          isActive={isActive}
          onRenameNode={onRenameNode}
          onMoveNode={onMoveNode}
          onDeleteNode={onDeleteNode}
          triggerClassName="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
        />
      </div>
    </File>
  );
};

export default TreeItem;
