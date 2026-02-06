"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CommentItem from "@/components/editor-workspace/comments/comment-item";
import { useComments } from "@/hooks/use-comments";
import { useParams } from "next/navigation";

export default function CommentsPanel({}) {
  const params = useParams();
  const projectId = params.projectId as string;
  const fsNodeId = params.nodeId as string;
  console.log("CommentsPanel projectId:", projectId);
  console.log("CommentsPanel fsNodeId:", fsNodeId);
  console.log("params:", params)
  const { comments, stats, isLoading } = useComments({
    fsNodeId: fsNodeId,
    includeResolved: true,
    projectId: projectId,
  });
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
                        fsNodeId={fsNodeId}
                        projectId={projectId}
                        comment={comment}
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
                        fsNodeId={fsNodeId}
                        projectId={projectId}
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
