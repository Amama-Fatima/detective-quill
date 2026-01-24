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
import { CreateCommentDto, CommentResponse } from "@detective-quill/shared-types";

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
  addComment: (data: CreateCommentDto) => Promise<CommentResponse | null>;
  projectId: string;
  nodeId: string;
}

export default function NewCommentDialog ({
  open,
  onOpenChange,
  selectedText,
  selectionData,
  setSelectedTextForComment,
  setSelectionData,
  setShowNewCommentDialog,
  addComment,
  projectId,
  nodeId,
}: NewCommentDialogProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (commentContent: string) => {
    const result = await addComment({
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

    setIsSubmitting(true);
    try {
      const result = await handleAddComment(content);
      if (result) {
        setContent("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!content.trim() || isSubmitting}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
