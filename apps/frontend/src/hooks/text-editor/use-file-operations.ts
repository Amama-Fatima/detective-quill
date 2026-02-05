import { useAuth } from "@/context/auth-context";
import {
  getFsNode,
  updateFileContent,
  deleteFsNode,
} from "@/lib/backend-calls/fs-nodes";
import { UpdateFileContentDto } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requireAccessToken } from "@/lib/utils/utils";
interface UseFileOperationsProps {
  nodeId: string;
}

export const useFileOperations = ({ nodeId }: UseFileOperationsProps) => {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const queryClient = useQueryClient();

  const {
    data: nodeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fsNode", nodeId],
    queryFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await getFsNode(nodeId, token);
      if (response.success && response.data) {
        return response.data || null;
      } else {
        throw new Error(response.error || "Failed to fetch file");
      }
    },
    enabled: !!nodeId && !!session?.access_token,
  });

  const saveFileMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = requireAccessToken(accessToken);
      const updateData: UpdateFileContentDto = { content };

      const response = await updateFileContent(nodeId, updateData, token);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to save file");
      }
    },
    onSuccess: () => {
      toast.success("File saved successfully");
      queryClient.invalidateQueries({ queryKey: ["fsNode", nodeId] });
    },
    onError: (error: any) => {
      console.error("Error saving file:", error);
      toast.error(error.message || "Failed to save file");
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await deleteFsNode(nodeId, token);
      if (response.success) {
        return;
      } else {
        throw new Error(response.error || "Failed to delete file");
      }
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Failed to delete file");
    },
  });

  return {
    nodeData,
    isLoading,
    error,
    saveFileMutation,
    deleteFileMutation,
  };
};
