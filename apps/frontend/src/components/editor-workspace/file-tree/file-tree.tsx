"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import {
  FileText,
  Loader2,
  Plus,
  FolderPlus,
  Folder,
  FolderOpen,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";
import { Tree } from "../../magicui/file-tree";
import CreateNodeDialog from "./create-node-dialog";
import RenameDialog from "./rename-dialog";
import MoveDialog from "./move-dialog";
import SearchInput from "./search-input";
import { useFileTreeNavigation } from "@/hooks/file-tree/use-file-tree-navigation";
import { useFileTreeState } from "@/hooks/file-tree/use-file-tree-state";
import { useFileTreeOperations } from "@/hooks/file-tree/use-file-tree-operations";
import TreeItem from "./tree-item";
import { findNodeById } from "@/lib/utils/file-tree-utils";

interface FileTreeProps {
  nodes: FsNodeTreeResponse[];
  onNodesChange: (nodes: FsNodeTreeResponse[]) => void;
  projectId: string;
  projectName: string;
  session: any;
  loading: boolean;
  isOwner: boolean;
  isActive: boolean;
}

const FileTree = ({
  nodes,
  onNodesChange,
  projectId,
  projectName,
  session,
  loading,
  isOwner,
  isActive,
}: FileTreeProps) => {
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
    description?: string,
  ) => {
    const success = await createNode(
      name,
      nodeType,
      parentId || selectedFolder || undefined,
      description,
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
              <Button
                size="sm"
                className="flex-1 gap-2 cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => openCreateDialog("file")}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
              >
                <FileText className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openCreateDialog("folder")}
                className="cursor-pointer"
                disabled={!isOwner || !isActive}
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
              searchExpanded && "bg-primary/10 text-primary cursor-pointer",
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
            <p className="text-[1rem] noir-text mb-4">
              No files or folders yet
            </p>
            <Button
              size="sm"
              onClick={() => openCreateDialog("file")}
              className="w-full cursor-pointer"
              disabled={!isOwner || !isActive}
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
                isOwner={isOwner}
                isActive={isActive}
              />
            ))}
          </Tree>
        )}
      </div>

      {/* Dialogs */}
      {isActive && isOwner && (
        <CreateNodeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateNode}
          creating={creating}
          nodeType={createType}
          folderName={
            selectedFolder
              ? findNodeById(nodes, selectedFolder)?.name
              : undefined
          }
          availableFolders={folderNodes}
        />
      )}

      {isOwner && isActive && (
        <RenameDialog
          open={renameDialogOpen}
          onOpenChange={setRenameDialogOpen}
          onSubmit={handleRenameNode}
          node={selectedNode}
          loading={renaming}
        />
      )}

      {isOwner && isActive && (
        <MoveDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          onSubmit={handleMoveNode}
          node={selectedNode}
          availableFolders={folderNodes}
          loading={moving}
        />
      )}
    </div>
  );
};

export default FileTree;