import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  getFsNode,
  updateFsNode,
  deleteFsNode,
} from "@/lib/backend-calls/fs-nodes";
import { UpdateFsNodeDto, FsNodeResponse } from "@detective-quill/shared-types";
import { toast } from "sonner";

interface UseFileOperationsProps {
  projectId: string;
  nodeId: string;
}

export const useFileOperations = ({
  projectId,
  nodeId,
}: UseFileOperationsProps) => {
  const [node, setNode] = useState<FsNodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const loadFile = useCallback(async () => {
    if (!session?.access_token || !nodeId) return;

    setLoading(true);
    try {
      const response = await getFsNode(nodeId, session.access_token);

      if (response.success && response.data) {
        const nodeData = response.data;

        // Check if it's a file (can't edit folders)
        if (nodeData.node_type !== "file") {
          toast.error("Cannot edit folders");
          router.push(`/workspace/${projectId}/text-editor`);
          return;
        }

        setNode(nodeData);
        return nodeData;
      } else {
        toast.error("File not found");
        router.push(`/workspace/${projectId}/text-editor`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching node:", error);
      toast.error("Failed to load file");
      router.push(`/workspace/${projectId}/text-editor`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [nodeId, session?.access_token, projectId, router]);

  const saveFile = useCallback(
    async (content: string) => {
      if (!node || !session?.access_token) {
        return false;
      }

      setSaving(true);
      try {
        const updateData: UpdateFsNodeDto = { content };

        const response = await updateFsNode(
          nodeId,
          updateData,
          session.access_token
        );

        if (response.success && response.data) {
          setNode(response.data);
          toast.success("File saved successfully");
          return true;
        } else {
          toast.error(response.error || "Failed to save file");
          return false;
        }
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error("Failed to save file");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [node, nodeId, session?.access_token]
  );

  const deleteFile = useCallback(async () => {
    if (!node || !session?.access_token) return;

    if (!confirm(`Are you sure you want to delete "${node.name}"?`)) return;

    try {
      const response = await deleteFsNode(nodeId, session.access_token);

      if (response.success) {
        toast.success("File deleted successfully");
        router.push(`/workspace/${projectId}/text-editor`);
      } else {
        toast.error(response.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  }, [node, nodeId, session?.access_token, projectId, router]);

  return {
    node,
    loading,
    saving,
    loadFile,
    saveFile,
    deleteFile,
  };
};
