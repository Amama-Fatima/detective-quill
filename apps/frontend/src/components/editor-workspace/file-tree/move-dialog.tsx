"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Folder, Home } from "lucide-react";
import { FsNode } from "@detective-quill/shared-types";

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newParentId: string | null) => Promise<void>;
  node: FsNode | null;
  availableFolders: Array<{ id: string; name: string; path: string }>;
  loading?: boolean;
}

export function MoveDialog({
  open,
  onOpenChange,
  onSubmit,
  node,
  availableFolders,
  loading = false,
}: MoveDialogProps) {
  const [selectedParent, setSelectedParent] = useState<string>("");

  // Set initial parent when dialog opens
  useEffect(() => {
    if (open && node) {
      setSelectedParent(node.parent_id || "root");
    }
  }, [open, node]);

  // Filter out the node itself and its children from available folders
  const validFolders = availableFolders.filter((folder) => {
    if (!node) return true;

    // Can't move a folder into itself
    if (folder.id === node.id) return false;

    // Can't move a folder into its own children
    if (
      node.node_type === "folder" &&
      folder.path.startsWith(node.path + "/")
    ) {
      return false;
    }

    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newParentId = selectedParent === "root" ? null : selectedParent;

    // Don't submit if parent hasn't changed
    if (newParentId === node?.parent_id) {
      handleClose();
      return;
    }

    await onSubmit(newParentId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedParent("");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!loading) {
      if (!open) {
        handleClose();
      } else {
        onOpenChange(open);
      }
    }
  };

  if (!node) return null;

  const isFile = node.node_type === "file";
  const icon = isFile ? FileText : Folder;
  const currentParent = availableFolders.find((f) => f.id === node.parent_id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <DialogTitle>Move {isFile ? "File" : "Folder"}</DialogTitle>
          </div>
          <DialogDescription>
            Choose a new location for "{node.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-select">Destination Folder</Label>
            <Select
              value={selectedParent}
              onValueChange={setSelectedParent}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>Root (Project Root)</span>
                  </div>
                </SelectItem>
                {validFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>{folder.path}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Current location indicator */}
            <div className="text-xs text-muted-foreground">
              <span>Current location: </span>
              <span className="font-medium">
                {currentParent ? currentParent.path : "Root"}
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedParent ||
                selectedParent === (node.parent_id || "root") ||
                loading
              }
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  {React.createElement(icon, { className: "h-4 w-4" })}
                  Move
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
