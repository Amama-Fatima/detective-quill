"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createFsNode,
  updateFsNode,
  deleteFsNode,
  moveFsNode,
} from "@/lib/backend-calls/fs-nodes";
import {
  CreateFsNodeDto,
  FsNodeTreeResponse,
  FsNodeResponse,
  UpdateFsNodeDto,
} from "@detective-quill/shared-types";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Plus,
  FolderPlus,
  MoreHorizontal,
  File as FileIcon,
  Folder,
  FolderOpen,
  Edit,
  FolderX,
  Search,
  Trash2,
} from "lucide-react";
import { WorkspaceFile, TreeViewElement } from "@/lib/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  File,
  Tree,
  TreeViewElement as TreeElement,
  Folder as TreeFolder,
} from "../../magicui/file-tree";
import { CreateNodeDialog } from "./create-node-dialog";
import { RenameDialog } from "./rename-dialog";
import { MoveDialog } from "./move-dialog";
import { SearchInput } from "./search-input";

interface FileTreeProps {
  nodes: FsNodeTreeResponse[];
  onNodesChange: (nodes: FsNodeTreeResponse[]) => void;
  projectId: string;
  projectName: string;
  session: any;
  loading: boolean;
}

export function FileTree({
  nodes,
  onNodesChange,
  projectId,
  projectName,
  session,
  loading,
}: FileTreeProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [moving, setMoving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FsNodeResponse | null>(null);
  const [createType, setCreateType] = useState<"file" | "folder">("file");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const selectedNodeId = params.nodeId as string;

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

  const handleNodeSelect = (nodeId: string) => {
    router.push(`/workspace/${projectId}/${nodeId}`);
  };

  const handleSearchSelect = (nodeId: string) => {
    const node = findNodeById(nodes, nodeId);
    if (node) {
      if (node.node_type === "file") {
        router.push(`/workspace/${projectId}/${nodeId}`);
      } else {
        toast.info(`Folder: ${node.name}`);
      }
    }
  };

  const handleCreateNode = async (
    name: string,
    nodeType: "file" | "folder",
    parentId?: string
  ) => {
    if (!session?.access_token) {
      toast.error("No session available");
      return;
    }

    setCreating(true);
    try {
      const createNodeData: CreateFsNodeDto = {
        project_id: projectId,
        parent_id: parentId || selectedFolder || undefined,
        name,
        node_type: nodeType,
        content: nodeType === "file" ? "" : undefined,
        file_extension: nodeType === "file" ? "md" : undefined,
      };

      const response = await createFsNode(createNodeData, session.access_token);

      if (response.success && response.data) {
        toast.success(
          `${nodeType === "file" ? "File" : "Folder"} created successfully`
        );

        window.location.reload();
        setCreateDialogOpen(false);
        setSelectedFolder(null);

        if (nodeType === "file") {
          router.push(`/workspace/${projectId}/${response.data.id}`);
        }
      } else {
        toast.error(response.error || `Failed to create ${nodeType}`);
      }
    } catch (error) {
      console.error(`Error creating ${nodeType}:`, error);
      toast.error(`Failed to create ${nodeType}`);
    } finally {
      setCreating(false);
    }
  };

  const handleRenameNode = async (newName: string) => {
    if (!selectedNode || !session?.access_token) return;

    setRenaming(true);
    try {
      const updateData: UpdateFsNodeDto = {
        name: newName,
      };

      const response = await updateFsNode(
        selectedNode.id,
        updateData,
        session.access_token
      );

      if (response.success) {
        toast.success(
          `${
            selectedNode.node_type === "file" ? "File" : "Folder"
          } renamed successfully`
        );
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to rename");
      }
    } catch (error) {
      console.error("Error renaming node:", error);
      toast.error("Failed to rename");
    } finally {
      setRenaming(false);
      setSelectedNode(null);
    }
  };

  const handleMoveNode = async (newParentId: string | null) => {
    if (!selectedNode || !session?.access_token) return;

    setMoving(true);
    try {
      const flattenNodes = (
        nodeList: FsNodeTreeResponse[]
      ): FsNodeTreeResponse[] => {
        const flattened: FsNodeTreeResponse[] = [];
        const traverse = (nodes: FsNodeTreeResponse[]) => {
          nodes.forEach((node) => {
            flattened.push(node);
            if (node.children) traverse(node.children);
          });
        };
        traverse(nodeList);
        return flattened;
      };

      const allNodes = flattenNodes(nodes);
      const siblings = allNodes.filter((n) => n.parent_id === newParentId);
      const newSortOrder =
        siblings.length > 0
          ? Math.max(...siblings.map((s) => s.sort_order || 0)) + 1
          : 1;

      const response = await moveFsNode(
        selectedNode.id,
        newParentId,
        newSortOrder,
        session.access_token
      );

      if (response.success) {
        toast.success(
          `${
            selectedNode.node_type === "file" ? "File" : "Folder"
          } moved successfully`
        );
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to move");
      }
    } catch (error) {
      console.error("Error moving node:", error);
      toast.error("Failed to move");
    } finally {
      setMoving(false);
      setSelectedNode(null);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!session?.access_token) return;

    const nodeToDelete = findNodeById(nodes, nodeId);
    if (!nodeToDelete) return;

    let confirmMessage: string;
    let cascadeDelete = false;

    if (nodeToDelete.node_type === "folder") {
      const countChildren = (node: FsNodeTreeResponse): number => {
        let count = 0;
        if (node.children) {
          count += node.children.length;
          node.children.forEach((child) => {
            count += countChildren(child);
          });
        }
        return count;
      };

      const childCount = countChildren(nodeToDelete);

      if (childCount > 0) {
        confirmMessage = `Are you sure you want to delete the folder "${nodeToDelete.name}" and all ${childCount} items inside it?\n\nThis action cannot be undone.`;
        cascadeDelete = true;
      } else {
        confirmMessage = `Are you sure you want to delete the empty folder "${nodeToDelete.name}"?`;
      }
    } else {
      confirmMessage = `Are you sure you want to delete the file "${nodeToDelete.name}"?`;
    }

    if (!confirm(confirmMessage)) return;

    try {
      const response = await deleteFsNode(
        nodeId,
        session.access_token,
        false,
        cascadeDelete
      );

      if (response.success) {
        toast.success(response.data?.message || "Item deleted successfully");

        if (selectedNodeId === nodeId) {
          router.push(`/workspace/${projectId}`);
        } else {
          window.location.reload();
        }
      } else {
        toast.error(response.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting node:", error);
      toast.error("Failed to delete item");
    }
  };

  const openCreateDialog = (type: "file" | "folder", folderId?: string) => {
    setCreateType(type);
    setSelectedFolder(folderId || null);
    setCreateDialogOpen(true);
  };

  const openRenameDialog = (node: FsNodeResponse) => {
    setSelectedNode(node);
    setRenameDialogOpen(true);
  };

  const openMoveDialog = (node: FsNodeResponse) => {
    setSelectedNode(node);
    setMoveDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading project...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="p-3 border-b bg-card/20">
        <div className="flex gap-2 mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => openCreateDialog("file")}>
                <FileText className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreateDialog("folder")}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchExpanded(!searchExpanded)}
            className={cn(
              "transition-colors",
              searchExpanded && "bg-primary/10 text-primary"
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {searchExpanded && (
          <SearchInput
            nodes={nodes}
            onResultSelect={handleSearchSelect}
            className="mb-2"
          />
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-hidden">
        {treeElements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 px-4">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-4">No files or folders yet</p>
            <Button
              size="sm"
              onClick={() => openCreateDialog("file")}
              className="w-full"
            >
              Create your first file
            </Button>
          </div>
        ) : (
          <Tree
            className="h-full p-2"
            initialSelectedId={selectedNodeId}
            elements={treeElements}
            indicator={true}
            openIcon={<FolderOpen className="h-4 w-4" />}
            closeIcon={<Folder className="h-4 w-4" />}
          >
            {treeElements.map((element) => (
              <TreeItem
                key={element.id}
                element={element}
                selectedNodeId={selectedNodeId}
                onNodeSelect={handleNodeSelect}
                onCreateFile={(folderId) => openCreateDialog("file", folderId)}
                onCreateFolder={(folderId) =>
                  openCreateDialog("folder", folderId)
                }
                onRenameNode={openRenameDialog}
                onMoveNode={openMoveDialog}
                onDeleteNode={handleDeleteNode}
                nodes={nodes}
                hoveredFolder={hoveredFolder}
                setHoveredFolder={setHoveredFolder}
              />
            ))}
          </Tree>
        )}
      </div>

      {/* Dialogs */}
      <CreateNodeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateNode}
        creating={creating}
        nodeType={createType}
        folderName={
          selectedFolder ? findNodeById(nodes, selectedFolder)?.name : undefined
        }
        availableFolders={getFolderNodes(nodes)}
      />

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onSubmit={handleRenameNode}
        node={selectedNode}
        loading={renaming}
      />

      <MoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        onSubmit={handleMoveNode}
        node={selectedNode}
        availableFolders={getFolderNodes(nodes)}
        loading={moving}
      />
    </div>
  );
}

// ✅ SOLUTION: Custom TreeItem that works with MagicUI's limitations
function TreeItem({
  element,
  selectedNodeId,
  onNodeSelect,
  onCreateFile,
  onCreateFolder,
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
  onCreateFile: (folderId: string) => void;
  onCreateFolder: (folderId: string) => void;
  onRenameNode: (node: FsNodeResponse) => void;
  onMoveNode: (node: FsNodeResponse) => void;
  onDeleteNode: (nodeId: string) => void;
  nodes: FsNodeTreeResponse[];
  hoveredFolder: string | null;
  setHoveredFolder: (id: string | null) => void;
}) {
  const node = findNodeById(nodes, element.id);
  const isSelected = selectedNodeId === element.id;
  const isHovered = hoveredFolder === element.id;

  if (element.isSelectable === false) {
    // This is a folder - SOLUTION: Custom wrapper around TreeFolder
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
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRenameNode={onRenameNode}
              onMoveNode={onMoveNode}
              onDeleteNode={onDeleteNode}
              nodes={nodes}
              hoveredFolder={hoveredFolder}
              setHoveredFolder={setHoveredFolder}
            />
          ))}

          {/* Folder Creation Actions */}
          <div
            className={cn(
              "ml-6 mt-1 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => onCreateFile(element.id)}
              >
                <FileText className="h-3 w-3 mr-1" />
                File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => onCreateFolder(element.id)}
              >
                <FolderPlus className="h-3 w-3 mr-1" />
                Folder
              </Button>
            </div>
          </div>
        </TreeFolder>

        {/* ✅ SOLUTION: Context Menu positioned absolutely outside TreeFolder */}
        <div
          className={cn(
            "absolute top-1 right-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => node && onRenameNode(node as FsNodeResponse)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNodeResponse)}
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteNode(element.id)}
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
    // This is a file (unchanged)
    return (
      <File
        value={element.id}
        isSelect={isSelected}
        handleSelect={onNodeSelect}
        className={cn(
          "px-2 py-1 group flex items-center justify-between",
          isSelected && "bg-primary/10 text-primary"
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
                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => node && onRenameNode(node as FsNodeResponse)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNodeResponse)}
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteNode(element.id)}
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
}

// Helper functions (unchanged)
function findNodeById(
  nodes: FsNodeTreeResponse[],
  nodeId: string
): FsNodeTreeResponse | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function getFolderNodes(
  nodes: FsNodeTreeResponse[]
): Array<{ id: string; name: string; path: string }> {
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
}
