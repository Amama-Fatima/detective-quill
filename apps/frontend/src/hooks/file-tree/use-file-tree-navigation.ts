import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { findNodeById } from "@/lib/utils/file-tree-utils";

interface UseFileTreeNavigationProps {
  projectId: string;
  nodes: FsNodeTreeResponse[];
  /** Base path for file links, e.g. "text-editor" or "knowledge-graph". Default "text-editor". */
  fileLinkBasePath?: string;
}

export const useFileTreeNavigation = ({
  projectId,
  nodes,
  fileLinkBasePath = "text-editor",
}: UseFileTreeNavigationProps) => {
  const router = useRouter();

  const navigateToNode = useCallback(
    (nodeId: string) => {
      router.push(`/workspace/${projectId}/${fileLinkBasePath}/${nodeId}`);
    },
    [router, projectId, fileLinkBasePath],
  );

  const prefetchNodeRoute = useCallback(
    (nodeId: string) => {
      router.prefetch(`/workspace/${projectId}/${fileLinkBasePath}/${nodeId}`);
    },
    [router, projectId, fileLinkBasePath],
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
    [nodes, navigateToNode],
  );

  return {
    navigateToNode,
    prefetchNodeRoute,
    handleSearchSelect,
  };
};
