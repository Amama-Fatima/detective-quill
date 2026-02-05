"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useComments } from "@/hooks/use-comments";

interface NewCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText?: string;
  selectionData: {
    text: string;
    blockId: string;
    startOffset: number;
    endOffset: number;
  } | null;
  setSelectedTextForComment: React.Dispatch<React.SetStateAction<string>>;
  setSelectionData: React.Dispatch<
    React.SetStateAction<{
      text: string;
      blockId: string;
      startOffset: number;
      endOffset: number;
    } | null>
  >;
  setShowNewCommentDialog: React.Dispatch<React.SetStateAction<boolean>>;
  projectId: string;
  nodeId: string;
}

export default function NewCommentDialog({
  open,
  onOpenChange,
  selectedText,
  selectionData,
  setSelectedTextForComment,
  setSelectionData,
  setShowNewCommentDialog,
  projectId,
  nodeId,
}: NewCommentDialogProps) {
  const [content, setContent] = useState("");
  const { addCommentMutation } = useComments({
    fsNodeId: nodeId,
    includeResolved: true,
    projectId: projectId,
  });
  const submitting = addCommentMutation.isPending;

  const handleAddComment = async (commentContent: string) => {
    const result = await addCommentMutation.mutateAsync({
      fs_node_id: nodeId,
      project_id: projectId,
      block_id: selectionData ? selectionData.blockId : "default-block",
      start_offset: selectionData ? selectionData.startOffset : 0,
      end_offset: selectionData ? selectionData.endOffset : 0,
      content: commentContent,
      selected_text: selectionData ? selectionData.text : "",
    });

    if (result) {
      setSelectedTextForComment("");
      setSelectionData(null);
      setShowNewCommentDialog(false);
      return result;
    } else {
      return null;
    }
  };

  const onSubmit = async () => {
    if (!content.trim()) return;
    const result = await handleAddComment(content);
    if (result) {
      setContent("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 cursor-pointer">
            <MessageSquare className="h-4 w-4" />
            Add Comment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedText && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Selected text:
              </p>
              <p className="text-sm italic line-clamp-3">{selectedText}</p>
            </div>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="Write your comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!content.trim() || submitting}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
