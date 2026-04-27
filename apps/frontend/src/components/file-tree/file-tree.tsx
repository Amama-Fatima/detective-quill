"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { FileText, Loader2, Folder, FolderOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Tree } from "../magicui/file-tree";
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
import CreateCommitDialog from "./dialogs/create-commit-dialog";
import { useWorkspaceContext } from "@/context/workspace-context";
import NewFileDropdown from "./new-file-dropdown";
import Image from "next/image";

interface FileTreeProps {
  initialNodes: FsNodeTreeResponse[];
  projectId: string;
  /** Base path for file links, e.g. "text-editor" or "knowledge-graph". Default "text-editor". */
  fileLinkBasePath?: string;
}

const FileTree = ({
  initialNodes,
  projectId,
  fileLinkBasePath = "text-editor",
}: FileTreeProps) => {
  const { activeBranchId, isOwner, isActive } = useWorkspaceContext();
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const params = useParams();
  const isKnowledgeGraph = fileLinkBasePath === "knowledge-graph";
  const selectedNodeId =
    (isKnowledgeGraph
      ? (params.fileId as string)
      : (params.nodeId as string)) ?? undefined;

  const {
    nodes,
    isLoading,
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

  const { navigateToNode, prefetchNodeRoute, handleSearchSelect } =
    useFileTreeNavigation({
      projectId,
      nodes,
      fileLinkBasePath,
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

  if (isLoading) {
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
    <div className="flex flex-col">
      <div className="p-3 border border-border bg-background rounded-lg">
        <div className="flex gap-2">
          {!isKnowledgeGraph && (
            <>
              <NewFileDropdown
                disabled={!isOwner || !isActive}
                onCreateFile={() => openCreateDialog("file")}
                onCreateFolder={() => openCreateDialog("folder")}
              />

              <Button
                size="sm"
                className="cursor-pointer"
                disabled={!isOwner || !isActive || !activeBranchId}
                onClick={() => setCommitDialogOpen(true)}
              >
                Commit changes
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchExpanded(!searchExpanded)}
            className={cn(
              "transition-colors text-primary cursor-pointer border border-primary",
              searchExpanded && "bg-primary/10 ",
            )}
          >
            <Search className="h-4 w-4 text-primary" />
          </Button>
        </div>

        {searchExpanded && (
          <SearchInput
            nodes={nodes}
            onResultSelect={handleSearchSelect}
            className="my-2"
          />
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {treeElements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 px-4">
            <Image
              src="/empty-folder.png"
              alt="Empty Folder"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
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
            openIcon={
              <Image
                src="/open-folder.png"
                alt="Open Folder"
                width={35}
                height={35}
              />
            }
            closeIcon={
              <Image
                src="/folder.png"
                alt="Open Folder"
                width={25}
                height={25}
              />
            }
          >
            {treeElements.map((element) => (
              <TreeItem
                key={element.id}
                element={element}
                selectedNodeId={selectedNodeId}
                onNodeSelect={navigateToNode}
                onNodeHover={prefetchNodeRoute}
                onRenameNode={openRenameDialog}
                onMoveNode={openMoveDialog}
                onDeleteNode={openDeleteDialog}
                nodes={nodes}
                hoveredFolder={hoveredFolder}
                setHoveredFolder={setHoveredFolder}
                isKnowledgeGraph={isKnowledgeGraph}
              />
            ))}
          </Tree>
        )}
      </div>

      {isActive && isOwner && (
        <>
          {activeBranchId && (
            <CreateCommitDialog
              projectId={projectId}
              branchId={activeBranchId}
              open={commitDialogOpen}
              onOpenChange={setCommitDialogOpen}
            />
          )}

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
        </>
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
