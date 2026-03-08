"use client";

import { SnapshotTreeNode } from "@/lib/utils/snapshot-tree-utils";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { CaseFileIcon } from "../icons/case-file-icon";



interface TreeNodesProps {
  nodes: SnapshotTreeNode[];
  level: number;
  expandedFolders: Set<string>;
  selectedNodeId: string | null;
  onNodeClick: (node: SnapshotTreeNode) => void;
}

export default function SnapshotTreeNodes({
  nodes,
  level,
  expandedFolders,
  selectedNodeId,
  onNodeClick,
}: TreeNodesProps) {
  return (
    <div className="">
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
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-accent" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-muted-accent" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" /> {/* Spacer for files */}
                <CaseFileIcon />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>

          {node.node_type === "folder" &&
            expandedFolders.has(node.fs_node_id || "") &&
            node.children &&
            node.children.length > 0 && (
              <SnapshotTreeNodes
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