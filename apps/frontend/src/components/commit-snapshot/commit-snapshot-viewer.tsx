"use client";

import { useState } from "react";
import { Commit } from "@detective-quill/shared-types";
import { SnapshotTreeNode } from "@/lib/utils/snapshot-tree-utils";
import SnapshotFileTree from "@/components/commit-snapshot/snapshot-file-tree";
import SnapshotTextViewer from "@/components/commit-snapshot/snapshot-text-viewer";
import { ArrowLeft, GitCommit, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRevertCommit } from "@/hooks/use-revert-commit";

interface CommitSnapshotViewerProps {
  commit: Commit;
  snapshots: SnapshotTreeNode[];
  projectId: string;
}

export default function CommitSnapshotViewer({
  commit,
  snapshots,
  projectId,
}: CommitSnapshotViewerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const router = useRouter();
  const revertCommitMutation = useRevertCommit({
    projectId,
    commitId: commit.id,
  });

  const date = commit.created_at ? new Date(commit.created_at) : null;
  const timeAgo = date ? formatDistanceToNow(date, { addSuffix: true }) : null;

  const handleRevertConfirm = async () => {
    await revertCommitMutation.mutateAsync();
    setIsRevertDialogOpen(false);
    router.push(`/workspace/${projectId}/version-control`);
    router.refresh();
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar with file tree */}
      <aside className="w-80 border-r bg-gradient-to-b from-card/50 to-card/30 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/workspace/${projectId}/version-control`)
            }
            className="mb-3 gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
          <div className="flex items-start gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <GitCommit className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                {commit.message || "No message"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-700 dark:text-amber-400">
            Read-only snapshot
          </div>

          <AlertDialog
            open={isRevertDialogOpen}
            onOpenChange={setIsRevertDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3 w-full gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Revert to this commit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Revert branch to this commit?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the branch head to this commit and permanently
                  delete all commits and snapshots created after it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={revertCommitMutation.isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer"
                  onClick={handleRevertConfirm}
                  disabled={revertCommitMutation.isPending}
                >
                  {revertCommitMutation.isPending
                    ? "Reverting..."
                    : "Yes, revert"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* File tree */}
        <SnapshotFileTree
          snapshots={snapshots}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
        />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0">
        <SnapshotTextViewer
          snapshots={snapshots}
          selectedNodeId={selectedNodeId}
        />
      </main>
    </div>
  );
}
