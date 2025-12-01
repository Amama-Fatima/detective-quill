import { useState, useMemo } from "react";
import { FsNodeTreeResponse, FsNode } from "@detective-quill/shared-types";
import { TreeViewElement } from "@/lib/types/workspace";

interface UseFileTreeStateProps {
  nodes: FsNodeTreeResponse[];
}

export const useFileTreeState = ({ nodes }: UseFileTreeStateProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FsNode | null>(null);
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  // Convert nodes to tree elements
  const treeElements: TreeViewElement[] = useMemo(() => {
    const convertNode = (node: FsNodeTreeResponse): TreeViewElement => ({
      id: node.id,
      name: node.name,
      isSelectable: node.node_type === "file",
      children: node.children?.map(convertNode) || [],
    });

    return nodes.map(convertNode);
  }, [nodes]);

  // Get folder nodes for dialogs
  const folderNodes = useMemo(() => {
    const folders: Array<{ id: string; name: string; path: string }> = [];

    const traverse = (nodeList: FsNodeTreeResponse[], parentPath = "") => {
      nodeList.forEach((node) => {
        if (node.node_type === "folder") {
          const currentPath = parentPath
            ? `${parentPath}/${node.name}`
            : node.name;
          folders.push({
            id: node.id,
            name: node.name,
            path: currentPath,
          });

          if (node.children) {
            traverse(node.children, currentPath);
          }
        }
      });
    };

    traverse(nodes);
    return folders;
  }, [nodes]);

  const openCreateDialog = (type: "file" | "folder", folderId?: string) => {
    setCreateType(type);
    setSelectedFolder(folderId || null);
    setCreateDialogOpen(true);
  };

  const openRenameDialog = (node: FsNode) => {
    setSelectedNode(node);
    setRenameDialogOpen(true);
  };

  const openMoveDialog = (node: FsNode) => {
    setSelectedNode(node);
    setMoveDialogOpen(true);
  };

  const closeDialogs = () => {
    setCreateDialogOpen(false);
    setRenameDialogOpen(false);
    setMoveDialogOpen(false);
    setSelectedFolder(null);
    setSelectedNode(null);
  };

  return {
    // State
    createDialogOpen,
    renameDialogOpen,
    moveDialogOpen,
    selectedFolder,
    selectedNode,
    createType,
    searchExpanded,
    hoveredFolder,
    treeElements,
    folderNodes,

    // Setters
    setCreateDialogOpen,
    setRenameDialogOpen,
    setMoveDialogOpen,
    setSelectedFolder,
    setSelectedNode,
    setCreateType,
    setSearchExpanded,
    setHoveredFolder,

    // Actions
    openCreateDialog,
    openRenameDialog,
    openMoveDialog,
    closeDialogs,
  };
};
