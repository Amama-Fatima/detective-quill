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
import CreateNodeDialog from "./dialogs/create-node-dialog";
import RenameDialog from "./dialogs/rename-dialog";
import MoveDialog from "./dialogs/move-dialog";
import ConfirmDeleteNodeDialog from "./dialogs/confirm-delete-node-dialog";
import SearchInput from "./search-input";
import { useFileTreeNavigation } from "@/hooks/file-tree/use-file-tree-navigation";
import { useFileTreeState } from "@/hooks/file-tree/use-file-tree-state";
import { useFileTreeOperations } from "@/hooks/file-tree/use-file-tree-operations";
import TreeItem from "./tree-item";
import { findNodeById } from "@/lib/utils/file-tree-utils";

interface FileTreeProps {
  initialNodes: FsNodeTreeResponse[];
  projectId: string;
  isOwner: boolean;
  isActive: boolean;
}

const FileTree = ({
  initialNodes,
  projectId,
  isOwner,
  isActive,
}: FileTreeProps) => {
  const params = useParams();
  const selectedNodeId = params.nodeId as string;

  const {
    nodes,
    isLoading,
    isFetching,
    createNodeMutation,
    renameNodeMutation,
    moveNodeMutation,
    deleteNodeMutation,
  } = useFileTreeOperations({
    projectId,
    initialNodes,
    selectedNodeId,
  });

  const {
    treeElements,
    folderNodes,
    createDialogOpen,
    renameDialogOpen,
    deleteDialogOpen,
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
    openDeleteDialog,
    setDeleteDialogOpen,
    closeDialogs,
  } = useFileTreeState({ nodes });

  const { navigateToNode, handleSearchSelect } = useFileTreeNavigation({
    projectId,
    nodes,
  });

  const handleCreateNode = async (
    name: string,
    nodeType: "file" | "folder",
    parentId?: string,
    description?: string,
  ) => {
    await createNodeMutation.mutateAsync({
      name,
      nodeType,
      parentId,
      description,
    });
    closeDialogs();
  };

  const handleRenameNode = async (newName: string) => {
    if (!selectedNode) return;
    await renameNodeMutation.mutateAsync({
      nodeId: selectedNode.id,
      newName,
    });
    closeDialogs();
  };

  const handleMoveNode = async (newParentId: string | null) => {
    if (!selectedNode) return;
    await moveNodeMutation.mutateAsync({
      nodeId: selectedNode.id,
      newParentId,
    });
    closeDialogs();
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!selectedNode) return;
    await deleteNodeMutation.mutateAsync({ nodeId, cascadeDelete: true });
    closeDialogs();
  };

  if (isLoading || isFetching) {
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
                onRenameNode={openRenameDialog}
                onMoveNode={openMoveDialog}
                onDeleteNode={openDeleteDialog}
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

      {isActive && isOwner && (
        <CreateNodeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateNode}
          creating={createNodeMutation.isPending}
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
          initialName={selectedNode ? selectedNode.name : ""}
          nodeType={selectedNode ? selectedNode.node_type : "file"}
          loading={renameNodeMutation.isPending}
        />
      )}

      {isOwner && isActive && (
        <MoveDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          onSubmit={handleMoveNode}
          node={selectedNode}
          availableFolders={folderNodes}
          loading={moveNodeMutation.isPending}
        />
      )}

      {isOwner && isActive && selectedNode && (
        <ConfirmDeleteNodeDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSubmit={() => handleDeleteNode(selectedNode.id)}
          loading={deleteNodeMutation.isPending}
          node={selectedNode}
          nodes={nodes}
        />
      )}
    </div>
  );
};

export default FileTree;
