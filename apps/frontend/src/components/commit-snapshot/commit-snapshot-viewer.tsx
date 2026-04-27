"use client";

import { useState } from "react";
import { Commit } from "@detective-quill/shared-types";
import { SnapshotTreeNode } from "@/lib/utils/snapshot-tree-utils";
import SnapshotFileTree from "@/components/commit-snapshot/snapshot-file-tree";
import SnapshotTextViewer from "@/components/commit-snapshot/snapshot-text-viewer";
import {
  ArrowLeft,
  GitCommit,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon } from "../icons/calendar-icon";
import RevertCommitDialog from "@/components/commit-snapshot/revert-commit-dialog";
import { useWorkspaceContext } from "@/context/workspace-context";

interface CommitSnapshotViewerProps {
  commit: Commit;
  snapshots: SnapshotTreeNode[];
  projectId: string;
  branchId?: string;
  activeBranchId?: string | null;
}

export default function CommitSnapshotViewer({
  commit,
  snapshots,
  projectId,
  branchId,
  activeBranchId,
}: CommitSnapshotViewerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const router = useRouter();

  const date = commit.created_at ? new Date(commit.created_at) : null;
  const timeAgo = date ? formatDistanceToNow(date, { addSuffix: true }) : null;
  const displayTime = timeAgo ?? "Unknown time";
  const commitBranchId = branchId ?? commit.branch_id;
  const historyPath = commitBranchId
    ? `/workspace/${projectId}/version-control/${commitBranchId}`
    : `/workspace/${projectId}/version-control`;
  const isActiveBranch =
    !!activeBranchId && !!commitBranchId && activeBranchId === commitBranchId;

  const { isOwner, isActive: isProjectActive } = useWorkspaceContext();

  return (
    <div className="flex h-screen w-full bg-background px-4">
      {/* Sidebar with file tree */}
      {isSidebarVisible && (
        <aside className="w-80 border-r bg-sidebar flex flex-col shadow-sm m-2 rounded-sm border">
          {/* Header */}
          <div className="p-4 border-b bg-card rounded-t-sm">
            <div className="mb-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(historyPath)}
                className="gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Button>
            </div>
            <div className="flex items-start gap-3 mb-2">
              <div className="rounded-full bg-primary/10 p-2 shrink-0">
                <GitCommit className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-md font-medium text-foreground line-clamp-2 mb-1">
                  {commit.message || "No message"}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{displayTime}</span>
                </div>
              </div>
            </div>
            {isProjectActive && isOwner && (
              <RevertCommitDialog
                projectId={projectId}
                commitId={commit.id}
                isActiveBranch={isActiveBranch}
                historyPath={historyPath}
              />
            )}
            <div className="mt-2 px-2 py-1 border border-dashed bg-foreground text-background rounded text-sm font-medium case-file w-fit">
              Read-only snapshot
            </div>
          </div>

          {/* File tree */}
          <SnapshotFileTree
            snapshots={snapshots}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
          />
        </aside>
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="bg-card/70 m-2 rounded-sm border px-3 py-2">
          {!isSidebarVisible && (
            <div className="">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarVisible(true)}
                className="gap-2 cursor-pointer text-primary"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isSidebarVisible && (
            <div className="">
              <div className="text-sm text-primary">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarVisible(false)}
                  className="cursor-pointer text-primary"
                  aria-label="Hide file tree"
                  title="Hide file tree"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <SnapshotTextViewer
          snapshots={snapshots}
          selectedNodeId={selectedNodeId}
        />
      </main>
    </div>
  );
}
