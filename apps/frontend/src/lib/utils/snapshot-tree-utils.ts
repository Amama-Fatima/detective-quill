import {
  buildTreeFromFlat,
  type CommitSnapshot,
  type TreeWithChildren,
} from "@detective-quill/shared-types";

export type SnapshotTreeNode = TreeWithChildren<CommitSnapshot>;

export function buildSnapshotTree(
  snapshots: CommitSnapshot[],
): SnapshotTreeNode[] {
  const validSnapshots = snapshots.filter((snapshot) => !!snapshot.fs_node_id);

  return buildTreeFromFlat(validSnapshots, {
    getId: (snapshot) => snapshot.fs_node_id,
    getParentId: (snapshot) => snapshot.parent_id,
    getDepth: (snapshot) => snapshot.depth,
    getSortOrder: (snapshot) => snapshot.sort_order,
    getTieBreaker: (snapshot) => snapshot.name || snapshot.fs_node_id || "",
  });
}

export function findSnapshotNode(
  nodes: SnapshotTreeNode[],
  nodeId: string,
): SnapshotTreeNode | null {
  for (const node of nodes) {
    if (node.fs_node_id === nodeId) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findSnapshotNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function countSnapshotNodes(nodes: SnapshotTreeNode[]): {
  files: number;
  folders: number;
} {
  let files = 0;
  let folders = 0;

  const count = (nodeList: SnapshotTreeNode[]) => {
    nodeList.forEach((node) => {
      if (node.node_type === "file") {
        files++;
      } else {
        folders++;
      }
      if (node.children.length > 0) {
        count(node.children);
      }
    });
  };

  count(nodes);
  return { files, folders };
}
