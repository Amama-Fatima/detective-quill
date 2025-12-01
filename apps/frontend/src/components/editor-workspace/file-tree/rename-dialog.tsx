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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Folder } from "lucide-react";
import { FsNode } from "@detective-quill/shared-types";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newName: string) => Promise<void>;
  node: FsNode | null;
  loading?: boolean;
}

export function RenameDialog({
  open,
  onOpenChange,
  onSubmit,
  node,
  loading = false,
}: RenameDialogProps) {
  const [name, setName] = useState("");

  // Set initial name when dialog opens
  useEffect(() => {
    if (open && node) {
      setName(node.name);
    }
  }, [open, node]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== node?.name) {
      await onSubmit(name.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setName("");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <DialogTitle>Rename {isFile ? "File" : "Folder"}</DialogTitle>
          </div>
          <DialogDescription>
            Enter a new name for "{node.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-input">
              {isFile ? "File" : "Folder"} Name
            </Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${isFile ? "file" : "folder"} name`}
              disabled={loading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleClose();
                }
              }}
            />
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
              disabled={!name.trim() || name.trim() === node.name || loading}
              className="gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                <>
                  {React.createElement(icon, { className: "h-4 w-4" })}
                  Rename
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
