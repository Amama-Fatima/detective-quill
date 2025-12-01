"use client";

import React, { useState } from "react";
import { CommentResponse } from "@detective-quill/shared-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Check,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentsPanelProps {
  comments: CommentResponse[];
  onAddComment: (
    content: string,
    blockId: string,
    startOffset: number,
    endOffset: number
  ) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onResolveComment: (commentId: string, isResolved: boolean) => Promise<void>;
  onCommentClick?: (comment: CommentResponse) => void;
  isLoading?: boolean;
}

export function CommentsPanel({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  onCommentClick,
  isLoading = false,
}: CommentsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleStartEdit = (comment: CommentResponse) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (editContent.trim()) {
      await onEditComment(commentId, editContent);
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unresolvedComments = comments.filter((c) => !c.is_resolved);
  const resolvedComments = comments.filter((c) => c.is_resolved);

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-l bg-background">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">Comments</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {unresolvedComments.length} active
          </span>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">
                No comments yet
              </div>
            ) : (
              <>
                {/* Unresolved Comments */}
                {unresolvedComments.length > 0 && (
                  <div className="space-y-3">
                    {unresolvedComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        isEditing={editingId === comment.id}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onDelete={onDeleteComment}
                        onResolve={onResolveComment}
                        onClick={onCommentClick}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}

                {/* Resolved Comments */}
                {resolvedComments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Resolved ({resolvedComments.length})</span>
                    </div>
                    {resolvedComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        isEditing={editingId === comment.id}
                        editContent={editContent}
                        onEditContentChange={setEditContent}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onDelete={onDeleteComment}
                        onResolve={onResolveComment}
                        onClick={onCommentClick}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

interface CommentItemProps {
  comment: CommentResponse;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onStartEdit: (comment: CommentResponse) => void;
  onSaveEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => Promise<void>;
  onResolve: (commentId: string, isResolved: boolean) => Promise<void>;
  onClick?: (comment: CommentResponse) => void;
  formatDate: (dateString: string) => string;
}

function CommentItem({
  comment,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onResolve,
  onClick,
  formatDate,
}: CommentItemProps) {
  // Extract selected text from comment
  const selectedText = comment.selected_text || null;

  return (
    <div
      className={cn(
        "group rounded-lg border p-3 transition-colors cursor-pointer hover:border-primary/50",
        comment.is_resolved ? "bg-muted/50 opacity-75" : "bg-card"
      )}
      onClick={() => onClick?.(comment)}
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
            {comment.is_resolved && (
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.created_at)}
          </span>
        </div>
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="min-h-[80px] resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSaveEdit(comment.id)}>
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
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
          <p className="text-sm whitespace-pre-wrap mb-3">{comment.content}</p>

          {/* Comment Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!comment.is_resolved && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(comment);
                      }}
                      className="h-7 px-2"
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
                        onResolve(comment.id, true);
                      }}
                      className="h-7 px-2"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resolve</TooltipContent>
                </Tooltip>
              </>
            )}

            {comment.is_resolved && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolve(comment.id, false);
                    }}
                    className="h-7 px-2"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unresolve</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(comment.id);
                  }}
                  className="h-7 px-2 text-destructive hover:text-destructive"
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
