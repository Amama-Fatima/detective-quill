"use client";

import { useState } from "react";
import { SnapshotTreeNode } from "@/lib/utils/snapshot-tree-utils";
import SnapshotTreeNodes from "./snapshot-tree-nodes";

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
        <SnapshotTreeNodes
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
