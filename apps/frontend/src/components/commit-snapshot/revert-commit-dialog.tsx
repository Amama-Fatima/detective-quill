"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

interface RevertCommitDialogProps {
  projectId: string;
  commitId: string;
  isActiveBranch: boolean;
  historyPath: string;
}

export default function RevertCommitDialog({
  projectId,
  commitId,
  isActiveBranch,
  historyPath,
}: RevertCommitDialogProps) {
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false);
  const router = useRouter();
  const revertCommitMutation = useRevertCommit({
    projectId,
    commitId,
  });

  const handleRevertConfirm = async () => {
    await revertCommitMutation.mutateAsync();
    setIsRevertDialogOpen(false);
    router.push(historyPath);
    router.refresh();
  };

  return (
    <AlertDialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3 w-full gap-2 cursor-pointer noir-text"
          disabled={!isActiveBranch}
        >
          <RotateCcw className="h-4 w-4" />
          Revert to this commit
        </Button>
      </AlertDialogTrigger>
      {!isActiveBranch && (
        <p className="mt-2 text-xs text-muted-foreground">
          Switch to this branch to revert its history.
        </p>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revert branch to this commit?</AlertDialogTitle>
          <AlertDialogDescription>
            This will move the branch head to this commit and permanently delete
            all commits and snapshots created after it.
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
            {revertCommitMutation.isPending ? "Reverting..." : "Yes, revert"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
