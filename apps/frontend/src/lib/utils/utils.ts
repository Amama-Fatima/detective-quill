import { FocusMode } from "@/stores/use-focus-mode-store";
import { clsx, type ClassValue } from "clsx";

import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getContainerClass = (focusMode: FocusMode) =>
  cn(
    "flex flex-col bg-background transition-all duration-300",
    focusMode === "NORMAL" && "h-screen",
    focusMode === "APP" && "fixed inset-0 z-50 h-screen",
    focusMode === "BROWSER" && "h-screen"
  );

const getHeaderClass = (focusMode: FocusMode) =>
  cn(
    "flex items-center justify-between border-b px-4 py-3 bg-card/50 flex-shrink-0 transition-all duration-300",
    focusMode === "BROWSER" && "bg-black/80 backdrop-blur-sm"
  );

const countNodes = (
  nodeList: FsNodeTreeResponse[]
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

function getFolderNodes(
  nodes: FsNodeTreeResponse[]
): Array<{ id: string; name: string; path: string }> {
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
}

function flattenNodes(nodes: FsNodeTreeResponse[]): FsNodeTreeResponse[] {
  const flattened: FsNodeTreeResponse[] = [];
  const traverse = (nodeList: FsNodeTreeResponse[]) => {
    nodeList.forEach((node) => {
      flattened.push(node);
      if (node.children) traverse(node.children);
    });
  };
  traverse(nodes);
  return flattened;
}

function countChildren(node: FsNodeTreeResponse): number {
  let count = 0;
  if (node.children) {
    count += node.children.length;
    node.children.forEach((child) => {
      count += countChildren(child);
    });
  }
  return count;
}

function convertNodesToTreeElements(nodes: FsNodeTreeResponse[]): Array<{
  id: string;
  name: string;
  isSelectable: boolean;
  children: any[];
}> {
  const convertNode = (
    node: FsNodeTreeResponse
  ): { id: string; name: string; isSelectable: boolean; children: any[] } => ({
    id: node.id,
    name: node.name,
    isSelectable: node.node_type === "file",
    children: node.children?.map(convertNode) || [],
  });

  return nodes.map(convertNode);
}

const getPasswordStrength = (password: string) => {
  if (password.length === 0) return { strength: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
  if (score < 4) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
  return { strength: 3, label: "Strong", color: "bg-green-500" };
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  // Use a consistent format that doesn't depend on locale
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export {
  cn,
  getContainerClass,
  getHeaderClass,
  countNodes,
  findNodeById,
  getFolderNodes,
  flattenNodes,
  countChildren,
  convertNodesToTreeElements,
  getPasswordStrength,
  formatDate,
};
