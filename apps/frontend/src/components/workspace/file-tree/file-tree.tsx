"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createFsNode,
  updateFsNode,
  deleteFsNode,
} from "@/lib/backend-calls/fs-nodes";
import {
  CreateFsNodeDto,
  FsNodeTreeResponse,
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
  const [creating, setCreating] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createType, setCreateType] = useState<"file" | "folder">("file");

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

  // Count files and folders
  const { fileCount, folderCount } = useMemo(() => {
    const countNodes = (
      nodeList: FsNodeTreeResponse[]
    ): { files: number; folders: number } => {
      let files = 0;
      let folders = 0;

      nodeList.forEach((node) => {
        if (node.node_type === "file") {
          files++;
        } else {
          folders++;
        }

        if (node.children) {
          const childCounts = countNodes(node.children);
          files += childCounts.files;
          folders += childCounts.folders;
        }
      });

      return { files, folders };
    };

    const counts = countNodes(nodes);
    return { fileCount: counts.files, folderCount: counts.folders };
  }, [nodes]);

  const handleNodeSelect = (nodeId: string) => {
    router.push(`/workspace/${projectName}/${nodeId}`);
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

        // Refresh the tree - you could optimize this by updating locally
        window.location.reload(); // Simple approach, or implement proper state update

        setCreateDialogOpen(false);
        setSelectedFolder(null);

        // Navigate to file if it's a file
        if (nodeType === "file") {
          router.push(`/workspace/${projectName}/${response.data.id}`);
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

  const handleDeleteNode = async (nodeId: string) => {
    if (!session?.access_token) return;

    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await deleteFsNode(nodeId, session.access_token);

      if (response.success) {
        toast.success("Item deleted successfully");
        window.location.reload(); // Simple approach
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
        <div className="flex gap-2">
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
        </div>
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
                onFolderContextMenu={setSelectedFolder}
                onCreateFile={(folderId) => openCreateDialog("file", folderId)}
                onCreateFolder={(folderId) =>
                  openCreateDialog("folder", folderId)
                }
                onDeleteNode={handleDeleteNode}
                nodes={nodes}
              />
            ))}
          </Tree>
        )}
      </div>

      {/* Create Dialog */}
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
    </div>
  );
}

// Helper functions
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

// Recursive Tree Item Component
function TreeItem({
  element,
  selectedNodeId,
  onNodeSelect,
  onFolderContextMenu,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  nodes,
}: {
  element: TreeViewElement;
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
  onFolderContextMenu: (folderId: string) => void;
  onCreateFile: (folderId: string) => void;
  onCreateFolder: (folderId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  nodes: FsNodeTreeResponse[];
}) {
  const node = findNodeById(nodes, element.id);
  const isSelected = selectedNodeId === element.id;

  if (element.isSelectable === false) {
    // This is a folder
    return (
      <TreeFolder
        value={element.id}
        element={element.name}
        className="px-2 py-1 group"
      >
        {element.children?.map((child) => (
          <TreeItem
            key={child.id}
            element={child}
            selectedNodeId={selectedNodeId}
            onNodeSelect={onNodeSelect}
            onFolderContextMenu={onFolderContextMenu}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDeleteNode={onDeleteNode}
            nodes={nodes}
          />
        ))}

        {/* Folder Actions */}
        <div className="ml-6 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move to...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteNode(element.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </File>
    );
  }
}
