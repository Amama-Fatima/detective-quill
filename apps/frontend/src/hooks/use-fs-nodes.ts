import { useState, useEffect } from "react";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { getProjectTree } from "@/lib/backend-calls/fs-nodes";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

interface UseFsNodesProps {
  projectId: string;
}

export function useFsNodes({ projectId }: UseFsNodesProps) {
  const [nodes, setNodes] = useState<FsNodeTreeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchNodes = async () => {
    if (!session?.access_token || !projectId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getProjectTree(projectId, session.access_token);

      if (response.success && response.data) {
        setNodes(response.data);
      } else {
        setError(response.error || "Failed to fetch project tree");
        toast.error(response.error || "Failed to fetch project tree");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, [projectId, session?.access_token]);

  const refetch = () => {
    fetchNodes();
  };

  return {
    nodes,
    loading,
    error,
    refetch,
    setNodes,
  };
}
