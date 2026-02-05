import { useRouter } from "next/navigation";
import {
  createFsNode,
  updateNodeMetadata,
  deleteFsNode,
  moveFsNode,
} from "@/lib/backend-calls/fs-nodes";
import {
  CreateFsNodeDto,
  FsNodeTreeResponse,
  UpdateNodeMetadataDto,
} from "@detective-quill/shared-types";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { getProjectTree } from "@/lib/backend-calls/fs-nodes";
import { flattenNodes } from "@/lib/utils/file-tree-utils";
import { requireAccessToken } from "@/lib/utils/utils";

interface UseFileTreeOperationsProps {
  projectId: string;
  initialNodes: FsNodeTreeResponse[];
  selectedNodeId?: string;
}

export const useFileTreeOperations = ({
  projectId,
  initialNodes,
  selectedNodeId,
}: UseFileTreeOperationsProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token || "";

  const router = useRouter();

  const {
    data: nodes = [],
    isLoading,
    isFetching,
  } = useQuery<FsNodeTreeResponse[]>({
    queryKey: ["project-tree", projectId],
    queryFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await getProjectTree(projectId, token);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch project tree");
      }
      return response.data;
    },
    initialData: initialNodes, // From server
  });

  const createNodeMutation = useMutation({
    mutationFn: async ({
      name,
      nodeType,
      parentId,
      description,
    }: {
      name: string;
      nodeType: "file" | "folder";
      parentId?: string;
      description?: string;
    }) => {
      const token = requireAccessToken(accessToken);
      const createNodeData: CreateFsNodeDto = {
        project_id: projectId,

        parent_id: parentId || undefined,
        name,
        node_type: nodeType,
        content: nodeType === "file" ? "" : undefined,
        file_extension: nodeType === "file" ? "md" : undefined,
        description: description,
      };
      const response = await createFsNode(createNodeData, token);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || `Failed to create ${nodeType}`);
    },
    onSuccess: (newNode) => {
      toast.success("Item created successfully");
      // Invalidate and refetch the project tree
      queryClient.invalidateQueries({ queryKey: ["project-tree", projectId] });
      // Navigate to file if it's a file
      if (newNode.node_type === "file") {
        router.push(`/workspace/${projectId}/text-editor/${newNode.id}`);
      }
    },
    onError: (error: any) => {
      console.error("Error creating node:", error);
      toast.error("Failed to create item");
    },
  });

  const renameNodeMutation = useMutation({
    mutationFn: async ({
      nodeId,
      newName,
    }: {
      nodeId: string;
      newName: string;
    }) => {
      const token = requireAccessToken(accessToken);
      const updateData: UpdateNodeMetadataDto = {
        name: newName,
      };
      const response = await updateNodeMetadata(nodeId, updateData, token);
      if (response.success) {
        return true;
      }
    },
    onSuccess: () => {
      toast.success("Item renamed successfully");
      queryClient.invalidateQueries({ queryKey: ["project-tree", projectId] });
    },
    onError: (error: any) => {
      console.error("Error renaming node:", error);
      toast.error("Failed to rename");
    },
  });

  const moveNodeMutation = useMutation({
    mutationFn: async ({
      nodeId,
      newParentId,
    }: {
      nodeId: string;
      newParentId: string | null;
    }) => {
      const token = requireAccessToken(accessToken);

      // Flatten tree to find siblings at destination parent level
      const allNodes = flattenNodes(nodes);
      const siblings = allNodes.filter((n) => n.parent_id === newParentId);

      // Calculate new sort order (place at end of siblings)
      const newSortOrder =
        siblings.length > 0
          ? Math.max(...siblings.map((s) => s.sort_order || 0)) + 1
          : 1;

      const response = await moveFsNode(
        nodeId,
        newParentId,
        newSortOrder,
        token,
      );
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Failed to move");
    },
    onSuccess: () => {
      toast.success("Item moved successfully");
      queryClient.invalidateQueries({ queryKey: ["project-tree", projectId] });
    },
    onError: (error: any) => {
      console.error("Error moving node:", error);
      toast.error("Failed to move");
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async ({
      nodeId,
      cascadeDelete,
    }: {
      nodeId: string;
      cascadeDelete: boolean;
    }) => {
      const token = requireAccessToken(accessToken);
      const response = await deleteFsNode(nodeId, token, false, cascadeDelete);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Failed to delete");
    },
    onSuccess: (deletedNode, variables) => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["project-tree", projectId] });

      // If deleting currently selected node, navigate away
      if (selectedNodeId === variables.nodeId) {
        router.push(`/workspace/${projectId}`);
      }
    },
    onError: (error: any) => {
      console.error("Error deleting node:", error);
      toast.error("Failed to delete item");
    },
  });

  return {
    createNodeMutation,
    renameNodeMutation,
    moveNodeMutation,
    deleteNodeMutation,
    nodes,
    isLoading,
    isFetching,
  };
};
