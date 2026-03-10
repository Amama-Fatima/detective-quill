import type {
  Database,
  FsNodeTreeResponse,
} from "@detective-quill/shared-types";

export type TreeWithChildren<T> = T & {
  children: TreeWithChildren<T>[];
};

export type ProjectFileTreeRow =
  Database["public"]["Views"]["project_file_tree"]["Row"];

export type ProjectWorkspaceTreeNode = FsNodeTreeResponse & {
  depth: number | null;
  children: ProjectWorkspaceTreeNode[];
};

function isMappableProjectFileTreeRow(
  node: ProjectFileTreeRow,
): node is ProjectFileTreeRow & {
  id: string;
  name: string;
  node_type: "folder" | "file";
  path: string;
  created_at: string;
  updated_at: string;
} {
  return (
    !!node.id &&
    !!node.name &&
    !!node.node_type &&
    !!node.path &&
    !!node.created_at &&
    !!node.updated_at
  );
}

export function mapProjectFileTreeRowsToTreeNodes(
  nodes: ProjectFileTreeRow[],
): ProjectWorkspaceTreeNode[] {
  return nodes.filter(isMappableProjectFileTreeRow).map((node) => ({
    id: node.id,
    name: node.name,
    node_type: node.node_type,
    branch_id: node.branch_id,
    parent_id: node.parent_id,
    content: node.content ?? undefined,
    word_count: node.word_count ?? 0,
    path: node.path,
    sort_order: node.sort_order,
    depth: node.depth,
    created_at: node.created_at,
    updated_at: node.updated_at,
    children: [],
  }));
}

interface BuildTreeFromFlatOptions<T> {
  getId: (item: T) => string | null | undefined;
  getParentId: (item: T) => string | null | undefined;
  getDepth?: (item: T) => number | null | undefined;
  getSortOrder?: (item: T) => number | null | undefined;
  getTieBreaker?: (item: T) => string;
}

const defaultComparator = <T>(
  a: T,
  b: T,
  getDepth: (item: T) => number,
  getSortOrder: (item: T) => number,
  getTieBreaker?: (item: T) => string,
): number => {
  const depthA = getDepth(a);
  const depthB = getDepth(b);
  if (depthA !== depthB) return depthA - depthB;

  const sortOrderA = getSortOrder(a);
  const sortOrderB = getSortOrder(b);
  if (sortOrderA !== sortOrderB) return sortOrderA - sortOrderB;

  if (getTieBreaker) {
    return getTieBreaker(a).localeCompare(getTieBreaker(b));
  }

  return 0;
};

export function buildTreeFromFlat<T>(
  items: T[],
  options: BuildTreeFromFlatOptions<T>,
): TreeWithChildren<T>[] {
  if (items.length === 0) return [];

  const getDepth = (item: T) => options.getDepth?.(item) ?? 0;
  const getSortOrder = (item: T) => options.getSortOrder?.(item) ?? 0;

  const sortedItems = [...items].sort((a, b) =>
    defaultComparator(a, b, getDepth, getSortOrder, options.getTieBreaker),
  );

  const nodeMap = new Map<string, TreeWithChildren<T>>();
  const rootNodes: TreeWithChildren<T>[] = [];

  sortedItems.forEach((item) => {
    const id = options.getId(item);
    if (!id) return;

    nodeMap.set(id, {
      ...item,
      children: [],
    });
  });

  sortedItems.forEach((item) => {
    const id = options.getId(item);
    if (!id) return;

    const node = nodeMap.get(id);
    if (!node) return;

    const parentId = options.getParentId(item);
    if (parentId) {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  const sortTree = (nodes: TreeWithChildren<T>[]) => {
    nodes.sort((a, b) =>
      defaultComparator(a, b, getDepth, getSortOrder, options.getTieBreaker),
    );
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };

  sortTree(rootNodes);
  return rootNodes;
}
