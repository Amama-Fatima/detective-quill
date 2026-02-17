import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCommits } from "@/hooks/use-commits";

interface CreateCommitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  branchId: string;
}

const CreateCommitDialog = (props: CreateCommitDialogProps) => {
  const { createCommitMutation } = useCommits(props.projectId);
  const loading = createCommitMutation.isPending;

  const handleCreateCommit = async (commitMessage: string) => {
    await createCommitMutation.mutateAsync({
      message: commitMessage,
      branch_id: props.branchId,
    });
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Commit</DialogTitle>
          <DialogDescription>
            Create a new commit for the current branch.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <label>Commit Message</label>
          <input
            type="text"
            placeholder="Enter commit message"
            className="w-full border rounded px-3 py-2 mt-1"
          />
          <p>
            Before commiting, make sure that you have saved all the changes.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateCommit("test commit message")}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Commit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommitDialog;
