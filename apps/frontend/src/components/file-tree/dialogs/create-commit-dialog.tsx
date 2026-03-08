import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCommits } from "@/hooks/commits/use-commits";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateCommitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  branchId: string;
}

const CreateCommitDialog = (props: CreateCommitDialogProps) => {
  const [commitMessage, setCommitMessage] = useState("");
  const { createCommitMutation } = useCommits(
    props.projectId,
  );
  const loading = createCommitMutation.isPending;

  const handleCreateCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error("Commit message cannot be empty");
      return;
    }
    await createCommitMutation.mutateAsync({
      message: commitMessage,
      branch_id: props.branchId,
    });
    setCommitMessage("");
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
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
          />
          <p>
            Before commiting, make sure that you have saved all the changes.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => props.onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCommit}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Commit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommitDialog;
