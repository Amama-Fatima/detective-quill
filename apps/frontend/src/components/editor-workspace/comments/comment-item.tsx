"use client";

import React, { useEffect, useState } from "react";
import { CommentResponse } from "@detective-quill/shared-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Trash2, Edit2, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils/comments-utils";

interface CommentItemProps {
  comment: CommentResponse;
  removeComment: (commentId: string) => Promise<boolean>;
  editComment: (
    commentId: string,
    data: { content: string },
  ) => Promise<CommentResponse | null>;
  toggleResolve: (commentId: string) => Promise<CommentResponse | null>;
}

export default function CommentItem({
  comment,
  removeComment,
  editComment,
  toggleResolve,
}: CommentItemProps) {
  const [content, setContent] = useState(comment.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isResolved, setIsResolved] = useState(comment.is_resolved);

  // Extract selected text from comment
  const selectedText = comment.selected_text || null;

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (content.trim()) {
      const edited = await editComment(commentId, { content });
      if (!edited) return;
      setContent(content);
      setIsEditing(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const deleted = await removeComment(commentId);
    if (!deleted) return;
  };

  const handleResolve = async (commentId: string) => {
    const updated = await toggleResolve(commentId);
    if (!updated) return;
    setIsResolved(true);
  };

  return (
    <div
      className={cn(
        "group rounded-lg border p-3 transition-colors cursor-pointer hover:border-primary/50",
        isResolved ? "bg-muted/50 opacity-75" : "bg-card",
      )}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {comment.author?.full_name ||
                comment.author?.username ||
                "Unknown"}
            </span>
            {isResolved && (
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSaveEdit(comment.id)}
              className="cursor-pointer"
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {selectedText && (
            <div className="mb-2 rounded bg-muted/50 px-2 py-1 text-xs italic text-muted-foreground border-l-2 border-primary/50">
              "{selectedText}"
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap mb-3">{content}</p>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isResolved && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit();
                      }}
                      className="h-7 px-2 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit comment</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(comment.id);
                      }}
                      className="h-7 px-2 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resolve</TooltipContent>
                </Tooltip>
              </>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(comment.id);
                  }}
                  className="h-7 px-2 text-destructive hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete comment</TooltipContent>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}
