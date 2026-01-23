import { useState, useEffect, useCallback } from "react";
import {
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
  CommentStats,
} from "@detective-quill/shared-types";
import {
  createComment,
  getCommentsByNode,
  updateComment,
  deleteComment,
  resolveComment,
  getCommentStats,
} from "@/lib/backend-calls/comments";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export interface UseCommentsOptions {
  fsNodeId: string;
  includeResolved?: boolean;
  projectId: string;
}

// If you call the hook multiple times with the same props, React will reuse the same hook instance, so no duplicate fetches occur.
// That is why we can do fetching inside the hook itself on mount.

export interface UseCommentsReturn {
  comments: CommentResponse[];
  stats: CommentStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addComment: (data: CreateCommentDto) => Promise<CommentResponse | null>;
  editComment: (
    commentId: string,
    data: UpdateCommentDto,
  ) => Promise<CommentResponse | null>;
  removeComment: (commentId: string) => Promise<boolean>;
  toggleResolve: (commentId: string) => Promise<CommentResponse | null>;
  refreshComments: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useComments({
  fsNodeId,
  includeResolved = true,
  projectId,
}: UseCommentsOptions): UseCommentsReturn {
  const { session } = useAuth();

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!session?.access_token || !fsNodeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCommentsByNode(
        projectId,
        fsNodeId,
        session.access_token,
        includeResolved,
      );

      if (response.success && response.data) {
        setComments(response.data);
      } else {
        setError(response.error || "Failed to fetch comments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [fsNodeId, session?.access_token, includeResolved]);

  const fetchStats = useCallback(async () => {
    if (!session?.access_token || !fsNodeId) return;

    try {
      const response = await getCommentStats(
        projectId,
        fsNodeId,
        session.access_token,
      );

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch comment stats:", err);
    }
  }, [fsNodeId, session?.access_token, projectId]);

  const addComment = useCallback(
    async (data: CreateCommentDto): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const payload = { ...data };

        const response = await createComment(payload, session.access_token);

        if (response.success && response.data) {
          setComments((prev) => [...prev, response.data!]);
          setStats((prev) => {
            if (!prev) {
              return { total: 1, resolved: 0, unresolved: 1 };
            }
            return {
              total: prev.total + 1,
              resolved: prev.resolved,
              unresolved: prev.unresolved + 1,
            };
          });

          toast.success("Comment added successfully");
          return response.data;
        } else {
          throw new Error(response.error || "Failed to add comment");
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add comment",
        );
        return null;
      }
    },
    [session?.access_token],
  );

  const editComment = useCallback(
    async (
      commentId: string,
      data: UpdateCommentDto,
    ): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const response = await updateComment(
          projectId,
          commentId,
          data,
          session.access_token,
        );

        if (response.success && response.data) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? response.data! : comment,
            ),
          );
          toast.success("Comment edited successfully");
          return response.data;
        } else {
          throw new Error(response.error || "Failed to edit comment");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [session?.access_token, projectId],
  );

  const removeComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!session?.access_token) return false;

      try {
        const response = await deleteComment(
          projectId,
          commentId,
          session.access_token,
        );

        if (response.success) {
          let wasResolved: boolean | undefined;
          setComments((prev) => {
            wasResolved = prev.find(
              (comment) => comment.id === commentId,
            )?.is_resolved;
            return prev.filter((comment) => comment.id !== commentId);
          });

          setStats((prev) => {
            if (!prev) return prev;
            return {
              total: prev.total - 1,
              resolved: wasResolved ? prev.resolved - 1 : prev.resolved,
              unresolved: wasResolved ? prev.unresolved : prev.unresolved - 1,
            };
          });

          toast.success("Comment deleted successfully");
          return true;
        } else {
          toast.error(response.error || "Failed to delete comment");
          return false;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [session?.access_token, projectId],
  );

  const toggleResolve = useCallback(
    async (commentId: string): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const response = await resolveComment(
          projectId,
          commentId,
          session.access_token,
        );

        if (response.success && response.data) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? response.data! : comment,
            ),
          );
          setStats((prev) => {
            if (!prev) return prev;
            const isNowResolved = response.data!.is_resolved;
            const newStats = {
              total: prev.total,
              resolved: isNowResolved ? prev.resolved + 1 : prev.resolved - 1,
              unresolved: isNowResolved
                ? prev.unresolved - 1
                : prev.unresolved + 1,
            };
            return newStats;
          });
          toast.success(`Comment resolved successfully`);
          return response.data;
        } else {
          toast.error(response.error || "Failed to update comment status");
          return null;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [session?.access_token, fsNodeId, projectId],
  );

  // Initial fetch
  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [fetchComments, fetchStats]);

  return {
    comments,
    stats,
    isLoading,
    error,
    addComment,
    editComment,
    removeComment,
    toggleResolve,
    refreshComments: fetchComments,
    refreshStats: fetchStats,
  };
}
