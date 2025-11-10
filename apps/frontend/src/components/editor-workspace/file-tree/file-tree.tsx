"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  FsNodeTreeResponse,
  FsNodeResponse,
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
import { TreeViewElement } from "@/lib/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
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
import { useFileTreeNavigation } from "@/hooks/file-tree/use-file-tree-navigation";
import { useFileTreeState } from "@/hooks/file-tree/use-file-tree-state";
import { useFileTreeOperations } from "@/hooks/file-tree/use-file-tree-operations";

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
  const params = useParams();
  const selectedNodeId = params.nodeId as string;

  const {
    treeElements,
    folderNodes,
    createDialogOpen,
    renameDialogOpen,
    moveDialogOpen,
    selectedFolder,
    selectedNode,
    createType,
    searchExpanded,
    hoveredFolder,
    setCreateDialogOpen,
    setRenameDialogOpen,
    setMoveDialogOpen,
    setSearchExpanded,
    setHoveredFolder,
    openCreateDialog,
    openRenameDialog,
    openMoveDialog,
    closeDialogs,
  } = useFileTreeState({ nodes });

  const { navigateToNode, handleSearchSelect } = useFileTreeNavigation({
    projectId,
    nodes,
  });

  const {
    creating,
    renaming,
    moving,
    createNode,
    renameNode,
    moveNode,
    deleteNode,
  } = useFileTreeOperations({
    projectId,
    session,
    nodes,
    selectedNodeId,
  });

  // Event handlers
  const handleCreateNode = async (
    name: string,
    nodeType: "file" | "folder",
    parentId?: string,
    description?: string
  ) => {
    const success = await createNode(
      name,
      nodeType,
      parentId || selectedFolder || undefined,
      description
    );
    if (success) {
      closeDialogs();
    }
  };

  const handleRenameNode = async (newName: string) => {
    if (!selectedNode) return;
    const success = await renameNode(selectedNode.id, newName);
    if (success) {
      closeDialogs();
    }
  };

  const handleMoveNode = async (newParentId: string | null) => {
    if (!selectedNode) return;
    const success = await moveNode(selectedNode.id, newParentId);
    if (success) {
      closeDialogs();
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    await deleteNode(nodeId);
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
              <Button size="sm" className="flex-1 gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => openCreateDialog("file")}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openCreateDialog("folder")}
                className="cursor-pointer"
              >
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
              searchExpanded && "bg-primary/10 text-primary cursor-pointer"
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
            <p className="text-[1rem] noir-text mb-4">No files or folders yet</p>
            <Button
              size="sm"
              onClick={() => openCreateDialog("file")}
              className="w-full cursor-pointer"
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
                onNodeSelect={navigateToNode}
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
        availableFolders={folderNodes}
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
        availableFolders={folderNodes}
        loading={moving}
      />
    </div>
  );
}

// TreeItem component (unchanged from original)
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
                className="h-6 text-xs cursor-pointer"
                onClick={() => onCreateFile(element.id)}
              >
                <FileText className="h-3 w-3 mr-1" />
                File
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs cursor-pointer"
                onClick={() => onCreateFolder(element.id)}
              >
                <FolderPlus className="h-3 w-3 mr-1" />
                Folder
              </Button>
            </div>
          </div>
        </TreeFolder>

        {/* Context Menu */}
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
                className="h-5 w-5 shrink-0 cursor-pointer"
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
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNodeResponse)}
                className="cursor-pointer"
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
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
                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
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
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => node && onMoveNode(node as FsNodeResponse)}
                className="cursor-pointer"
              >
                <FolderX className="h-4 w-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
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

// Helper function
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
