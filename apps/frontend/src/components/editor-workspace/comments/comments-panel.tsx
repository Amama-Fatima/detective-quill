"use client";

import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CommentItem from "@/components/editor-workspace/comments/comment-item";
import {
  CommentResponse,
  CommentStats,
  UpdateCommentDto,
} from "@detective-quill/shared-types";

interface CommentsPanelProps {
  comments: CommentResponse[];
  isLoading: boolean;
  stats: CommentStats | null;
  removeComment: (commentId: string) => Promise<boolean>;
  editComment: (
    commentId: string,
    data: UpdateCommentDto,
  ) => Promise<CommentResponse | null>;
  toggleResolve: (commentId: string) => Promise<CommentResponse | null>;
}

export function CommentsPanel({
  comments,
  isLoading,
  stats,
  removeComment,
  editComment,
  toggleResolve,
}: CommentsPanelProps) {
  const [resolvedComments, unresolvedComments] = React.useMemo(() => {
    const resolved: typeof comments = [];
    const unresolved: typeof comments = [];
    comments.forEach((comment) => {
      if (comment.is_resolved) {
        resolved.push(comment);
      } else {
        unresolved.push(comment);
      }
    });
    return [resolved, unresolved];
  }, [comments]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full border-l bg-background">
        <div className="flex items-center gap-2 border-b px-4 py-3 flex-shrink-0">
          <MessageSquare className="h-4 w-4" />
          <h3 className="font-medium">Comments</h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {stats?.unresolved} active
          </span>
        </div>

        <ScrollArea className="flex-1 h-0">
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
                        removeComment={removeComment}
                        editComment={editComment}
                        toggleResolve={toggleResolve}
                      />
                    ))}
                  </div>
                )}

                {/* Resolved Comments */}
                {resolvedComments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Resolved ({stats?.resolved})</span>
                    </div>
                    {resolvedComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        removeComment={removeComment}
                        editComment={editComment}
                        toggleResolve={toggleResolve}
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
