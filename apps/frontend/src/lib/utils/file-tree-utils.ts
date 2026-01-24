import { FsNodeTreeResponse } from "@detective-quill/shared-types";

export const findNodeById = (
  nodes: FsNodeTreeResponse[],
  nodeId: string,
): FsNodeTreeResponse | null => {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
};
