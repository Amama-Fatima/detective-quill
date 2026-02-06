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

//  flatten hierarchical tree into flat array
export const flattenNodes = (
  nodeList: FsNodeTreeResponse[],
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

export const getFolderNodes = (
  nodes: FsNodeTreeResponse[],
): Array<{ id: string; name: string; path: string }> => {
  const folders: Array<{ id: string; name: string; path: string }> = [];

  const traverse = (nodeList: FsNodeTreeResponse[], parentPath = "") => {
    nodeList.forEach((node) => {
      if (node.node_type === "folder") {
        const currentPath = parentPath
          ? `${parentPath}/${node.name}`
          : node.name;
        folders.push({
          id: node.id,
          name: node.name,
          path: currentPath,
        });

        if (node.children) {
          traverse(node.children, currentPath);
        }
      }
    });
  };

  traverse(nodes);
  return folders;
};

export const convertNodesToTreeElements = (
  nodes: FsNodeTreeResponse[],
): Array<{
  id: string;
  name: string;
  isSelectable: boolean;
  children: any[];
}> => {
  const convertNode = (
    node: FsNodeTreeResponse,
  ): { id: string; name: string; isSelectable: boolean; children: any[] } => ({
    id: node.id,
    name: node.name,
    isSelectable: node.node_type === "file",
    children: node.children?.map(convertNode) || [],
  });

  return nodes.map(convertNode);
};

export const countChildren = (node: FsNodeTreeResponse): number => {
  let count = 0;
  if (node.children) {
    count += node.children.length;
    node.children.forEach((child) => {
      count += countChildren(child);
    });
  }
  return count;
};

export const countNodes = (
  nodeList: FsNodeTreeResponse[],
): { files: number; folders: number } => {
  let files = 0;
  let folders = 0;

  nodeList.forEach((node) => {
    if (node.node_type === "file") {
      files++;
    } else {
      folders++;
    }

    if (node.children) {
      const childCounts = countNodes(node.children);
      files += childCounts.files;
      folders += childCounts.folders;
    }
  });

  return { files, folders };
};
