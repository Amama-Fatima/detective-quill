import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  getFsNode,
  updateFsNode,
  deleteFsNode,
} from "@/lib/backend-calls/fs-nodes";
import { UpdateFsNodeDto, FsNode } from "@detective-quill/shared-types";
import { toast } from "sonner";

interface UseFileOperationsProps {
  projectId: string;
  initialNode: FsNode;
}

export const useFileOperations = ({
  projectId,
  initialNode,
}: UseFileOperationsProps) => {
  const [node, setNode] = useState<FsNode | null>(initialNode);
  const [saving, setSaving] = useState(false);
  const { session } = useAuth();
  const router = useRouter();

  const saveFile = useCallback(
    async (content: string) => {
      if (!node || !session?.access_token) {
        console.log("NOT SAVING FILE RIGHT NOW");
        console.log("access token is ", session?.access_token);
        return false;
      }

      setSaving(true);
      try {
        const updateData: UpdateFsNodeDto = { content };

        const response = await updateFsNode(
          node.id,
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
    [node, session?.access_token]
  );

  const deleteFile = useCallback(async () => {
    if (!node || !session?.access_token) return;

    if (!confirm(`Are you sure you want to delete "${node.name}"?`)) return;

    try {
      const response = await deleteFsNode(node.id, session.access_token);

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
  }, [node, session?.access_token, projectId, router]);

  return {
    node,
    saving,
    saveFile,
    deleteFile,
  };
};
