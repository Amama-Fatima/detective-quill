"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Folder, FolderPlus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CreateNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    name: string,
    nodeType: "file" | "folder",
    parentId?: string,
    description?: string
  ) => Promise<void>;
  creating?: boolean;
  nodeType: "file" | "folder";
  folderName?: string; // Pre-selected folder name
  availableFolders?: Array<{ id: string; name: string; path: string }>;
}

export function CreateNodeDialog({
  open,
  onOpenChange,
  onSubmit,
  creating = false,
  nodeType,
  folderName,
  availableFolders = [],
}: CreateNodeDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(
    folderName
      ? availableFolders.find((f) => f.name === folderName)?.id || ""
      : ""
  );

  const handleSubmit = async () => {
    if (name.trim()) {
      console.log("selected folder sending as parent id is ", selectedFolder);
      await onSubmit(
        name.trim(),
        nodeType,
        selectedFolder || undefined,
        description.trim()
      );
      setName("");
      setSelectedFolder("");
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedFolder("");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!creating) {
      if (!open) {
        handleClose();
      } else {
        onOpenChange(open);
      }
    }
  };

  const isFile = nodeType === "file";
  const icon = isFile ? FileText : FolderPlus;
  const title = isFile ? "Create New File" : "Create New Folder";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-5 w-5 text-primary" })}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {folderName
              ? `Create a new ${nodeType} in "${folderName}"`
              : `Enter a name and choose a location for your new ${nodeType}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Node Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{isFile ? "File" : "Folder"} Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isFile
                  ? "e.g., Chapter 1, Introduction..."
                  : "e.g., Part I, Character Notes..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleClose();
                }
              }}
              autoFocus
              disabled={creating}
              className="w-full"
            />
            <Label htmlFor="description">
              {isFile ? "File" : "Folder"} Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isFile
                  ? "e.g., A brief description of the file..."
                  : "e.g., A brief description of the folder..."
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleClose();
                }
              }}
              autoFocus
              disabled={creating}
              className="w-full"
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label htmlFor="folder">Location</Label>
            <Select
              value={selectedFolder}
              onValueChange={setSelectedFolder}
              disabled={creating || !!folderName}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a folder or leave in root" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Root (No folder)</span>
                  </div>
                </SelectItem>
                {availableFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>{folder.path}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {folderName && (
              <p className="text-xs text-muted-foreground">
                This {nodeType} will be created in the "{folderName}" folder.
              </p>
            )}
          </div>

          {/* Preview */}
          {name && (
            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Preview:</Label>
              <div className="flex items-center gap-2 text-sm">
                {selectedFolder ? (
                  <>
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {
                        availableFolders.find((f) => f.id === selectedFolder)
                          ?.path
                      }
                    </span>
                    <span className="text-muted-foreground">/</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Root /</span>
                  </>
                )}
                <span className="font-medium">{name}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={creating}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || creating}
            className="gap-2 cursor-pointer"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {React.createElement(icon, { className: "h-4 w-4" })}
                Create {isFile ? "File" : "Folder"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
