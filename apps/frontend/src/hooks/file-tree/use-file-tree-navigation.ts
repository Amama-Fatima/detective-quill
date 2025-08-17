import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { toast } from "sonner";

interface UseFileTreeNavigationProps {
  projectId: string;
  nodes: FsNodeTreeResponse[];
}

export const useFileTreeNavigation = ({
  projectId,
  nodes,
}: UseFileTreeNavigationProps) => {
  const router = useRouter();

  const navigateToNode = useCallback(
    (nodeId: string) => {
      router.push(`/workspace/${projectId}/text-editor/${nodeId}`);
    },
    [router, projectId]
  );

  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      const node = findNodeById(nodes, nodeId);
      if (node) {
        if (node.node_type === "file") {
          navigateToNode(nodeId);
        } else {
          toast.info(`Folder: ${node.name}`);
        }
      }
    },
    [nodes, navigateToNode]
  );

  return {
    navigateToNode,
    handleSearchSelect,
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
