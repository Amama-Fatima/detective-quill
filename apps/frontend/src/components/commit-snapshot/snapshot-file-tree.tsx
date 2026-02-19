"use client";

import { useState } from "react";
import { SnapshotTreeNode } from "@/lib/utils/snapshot-tree-utils";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface SnapshotFileTreeProps {
  snapshots: SnapshotTreeNode[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

export default function SnapshotFileTree({
  snapshots,
  selectedNodeId,
  onNodeSelect,
}: SnapshotFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const toggleFolder = (nodeId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleNodeClick = (node: SnapshotTreeNode) => {
    const nodeId = node.fs_node_id;
    if (!nodeId) return;

    if (node.node_type === "folder") {
      toggleFolder(nodeId);
    } else {
      onNodeSelect(nodeId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {snapshots.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          No files in this snapshot
        </div>
      ) : (
        <TreeNodes
          nodes={snapshots}
          level={0}
          expandedFolders={expandedFolders}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}

interface TreeNodesProps {
  nodes: SnapshotTreeNode[];
  level: number;
  expandedFolders: Set<string>;
  selectedNodeId: string | null;
  onNodeClick: (node: SnapshotTreeNode) => void;
}

function TreeNodes({
  nodes,
  level,
  expandedFolders,
  selectedNodeId,
  onNodeClick,
}: TreeNodesProps) {
  return (
    <div>
      {nodes.map((node) => (
        <div key={node.fs_node_id || node.id}>
          <button
            onClick={() => onNodeClick(node)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors cursor-pointer",
              "hover:bg-accent/50",
              selectedNodeId === node.fs_node_id &&
                node.node_type === "file" &&
                "bg-accent text-accent-foreground",
            )}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {node.node_type === "folder" ? (
              <>
                {expandedFolders.has(node.fs_node_id || "") ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                {expandedFolders.has(node.fs_node_id || "") ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" /> {/* Spacer for files */}
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>

          {node.node_type === "folder" &&
            expandedFolders.has(node.fs_node_id || "") &&
            node.children &&
            node.children.length > 0 && (
              <TreeNodes
                nodes={node.children}
                level={level + 1}
                expandedFolders={expandedFolders}
                selectedNodeId={selectedNodeId}
                onNodeClick={onNodeClick}
              />
            )}
        </div>
      ))}
    </div>
  );
}
