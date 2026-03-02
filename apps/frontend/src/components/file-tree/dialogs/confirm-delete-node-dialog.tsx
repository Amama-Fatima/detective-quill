import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { countChildren, findNodeById } from "@/lib/utils/file-tree-utils";
import { FsNodeTreeResponse, FsNode } from "@detective-quill/shared-types";

interface DeleteNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  node: FsNode;
  nodes: FsNodeTreeResponse[];
}

const ConfirmDeleteNodeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
  nodes,
  node,
}: DeleteNodeDialogProps) => {
  const nodeToDelete = findNodeById(nodes, node.id);

  if (!nodeToDelete) {
    toast.error("Node not found");
    return null;
  }

  let confirmMessage = `Are you sure you want to delete the ${nodeToDelete.node_type} "${nodeToDelete.name}"?`;

  const childCount = countChildren(nodeToDelete);

  if (nodeToDelete.node_type === "folder" && childCount > 0) {
    confirmMessage = `Are you sure you want to delete the folder "${nodeToDelete.name}" and all ${childCount} items inside it?\n\nThis action cannot be undone.`;
  }

  const handleOpenChange = (open: boolean) => {
    if (!loading) {
      if (!open) {
        onOpenChange(false);
      } else {
        onOpenChange(open);
      }
    }
  };

  const isFile = nodeToDelete.node_type === "file";
  const icon = isFile ? FileText : Folder;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <DialogTitle>Delete {isFile ? "File" : "Folder"}</DialogTitle>
          </div>
          <DialogDescription>{confirmMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteNodeDialog;
