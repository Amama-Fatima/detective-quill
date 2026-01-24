"use client";

import { useState } from "react";
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
import { Loader2, FileText, Folder } from "lucide-react";

interface CreateChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, folderId?: string) => Promise<void>;
  creating?: boolean;
  folderName?: string; // Pre-selected folder name
  folders?: Array<{ id: string; name: string }>; // Available folders
}

const CreateChapterDialog = ({
  open,
  onOpenChange,
  onSubmit,
  creating = false,
  folderName,
  folders = [
    { id: "part-1", name: "Part I: The Beginning" },
    { id: "part-2", name: "Part II: The Journey" },
    { id: "characters", name: "Character Development" },
    { id: "world-building", name: "World Building" },
  ],
}: CreateChapterDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(
    folderName ? folders.find((f) => f.name === folderName)?.id || "" : ""
  );

  const handleSubmit = async () => {
    if (title.trim()) {
      await onSubmit(title.trim(), selectedFolder || undefined);
      setTitle("");
      setSelectedFolder("");
    }
  };

  const handleClose = () => {
    setTitle("");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Create New Chapter</DialogTitle>
          </div>
          <DialogDescription>
            {folderName
              ? `Create a new chapter in "${folderName}"`
              : "Enter a title and choose a location for your new chapter."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Chapter Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Adventure Begins, Character Introduction..."
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
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>{folder.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {folderName && (
              <p className="text-[1rem] noir-text text-muted-foreground">
                This chapter will be created in the "{folderName}" folder.
              </p>
            )}
          </div>
          {/* Preview */}
          {title && (
            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Preview:</Label>
              <div className="flex items-center gap-2 text-sm">
                {selectedFolder ? (
                  <>
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {folders.find((f) => f.id === selectedFolder)?.name}
                    </span>
                    <span className="text-muted-foreground">/</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Root /</span>
                  </>
                )}
                <span className="font-medium">{title}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="cursor-pointer disabled:cursor-not-allowed"
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || creating}
            className="gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Create Chapter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default CreateChapterDialog;