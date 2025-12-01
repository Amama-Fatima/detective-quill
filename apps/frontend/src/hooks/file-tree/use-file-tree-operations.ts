import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createFsNode,
  updateFsNode,
  deleteFsNode,
  moveFsNode,
} from "@/lib/backend-calls/fs-nodes";
import {
  CreateFsNodeDto,
  FsNodeTreeResponse,
  FsNode,
  UpdateFsNodeDto,
} from "@detective-quill/shared-types";
import { toast } from "sonner";

interface UseFileTreeOperationsProps {
  projectId: string;
  session: any;
  nodes: FsNodeTreeResponse[];
  selectedNodeId?: string;
}

export const useFileTreeOperations = ({
  projectId,
  session,
  nodes,
  selectedNodeId,
}: UseFileTreeOperationsProps) => {
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [moving, setMoving] = useState(false);
  const router = useRouter();

  const createNode = useCallback(
    async (
      name: string,
      nodeType: "file" | "folder",
      parentId?: string,
      description?: string
    ): Promise<boolean> => {
      if (!session?.access_token) {
        toast.error("No session available");
        return false;
      }

      setCreating(true);
      try {
        const createNodeData: CreateFsNodeDto = {
          project_id: projectId,
          parent_id: parentId || undefined,
          name,
          node_type: nodeType,
          content: nodeType === "file" ? "" : undefined,
          file_extension: nodeType === "file" ? "md" : undefined,
          description: description,
        };

        const response = await createFsNode(
          createNodeData,
          session.access_token
        );

        if (response.success && response.data) {
          toast.success(
            `${nodeType === "file" ? "File" : "Folder"} created successfully`
          );

          // Refresh the page to get updated data
          window.location.reload();

          // Navigate to file if it's a file
          if (nodeType === "file") {
            router.push(
              `/workspace/${projectId}/text-editor/${response.data.id}`
            );
          }

          return true;
        } else {
          toast.error(response.error || `Failed to create ${nodeType}`);
          return false;
        }
      } catch (error) {
        console.error(`Error creating ${nodeType}:`, error);
        toast.error(`Failed to create ${nodeType}`);
        return false;
      } finally {
        setCreating(false);
      }
    },
    [projectId, session, router]
  );

  const renameNode = useCallback(
    async (nodeId: string, newName: string): Promise<boolean> => {
      if (!session?.access_token) {
        toast.error("No session available");
        return false;
      }

      setRenaming(true);
      try {
        const updateData: UpdateFsNodeDto = {
          name: newName,
        };

        const response = await updateFsNode(
          nodeId,
          updateData,
          session.access_token
        );

        if (response.success) {
          toast.success("Item renamed successfully");
          window.location.reload();
          return true;
        } else {
          toast.error(response.error || "Failed to rename");
          return false;
        }
      } catch (error) {
        console.error("Error renaming node:", error);
        toast.error("Failed to rename");
        return false;
      } finally {
        setRenaming(false);
      }
    },
    [session]
  );

  const moveNode = useCallback(
    async (nodeId: string, newParentId: string | null): Promise<boolean> => {
      if (!session?.access_token) {
        toast.error("No session available");
        return false;
      }

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
          nodeId,
          newParentId,
          newSortOrder,
          session.access_token
        );

        if (response.success) {
          toast.success("Item moved successfully");
          window.location.reload();
          return true;
        } else {
          toast.error(response.error || "Failed to move");
          return false;
        }
      } catch (error) {
        console.error("Error moving node:", error);
        toast.error("Failed to move");
        return false;
      } finally {
        setMoving(false);
      }
    },
    [session, nodes]
  );

  const deleteNode = useCallback(
    async (nodeId: string): Promise<boolean> => {
      if (!session?.access_token) {
        toast.error("No session available");
        return false;
      }

      try {
        const nodeToDelete = findNodeById(nodes, nodeId);
        if (!nodeToDelete) {
          toast.error("Node not found");
          return false;
        }

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

        if (!confirm(confirmMessage)) return false;

        const response = await deleteFsNode(
          nodeId,
          session.access_token,
          false,
          cascadeDelete
        );

        if (response.success) {
          toast.success(response.data?.message || "Item deleted successfully");

          // If deleting currently selected node, navigate away
          if (selectedNodeId === nodeId) {
            router.push(`/workspace/${projectId}`);
          } else {
            window.location.reload();
          }

          return true;
        } else {
          toast.error(response.error || "Failed to delete item");
          return false;
        }
      } catch (error) {
        console.error("Error deleting node:", error);
        toast.error("Failed to delete item");
        return false;
      }
    },
    [session, nodes, selectedNodeId, projectId, router]
  );

  return {
    creating,
    renaming,
    moving,
    createNode,
    renameNode,
    moveNode,
    deleteNode,
  };
};

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
