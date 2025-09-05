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
  unresolveComment,
  getCommentStats,
} from "@/lib/backend-calls/comments";
import { useAuth } from "@/context/auth-context";

export interface UseCommentsOptions {
  fsNodeId: string;
  includeResolved?: boolean;
}

export interface UseCommentsReturn {
  comments: CommentResponse[];
  stats: CommentStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addComment: (
    data: Omit<CreateCommentDto, "fs_node_id">
  ) => Promise<CommentResponse | null>;
  editComment: (
    commentId: string,
    data: UpdateCommentDto
  ) => Promise<CommentResponse | null>;
  removeComment: (commentId: string) => Promise<boolean>;
  toggleResolve: (
    commentId: string,
    isResolved: boolean
  ) => Promise<CommentResponse | null>;
  refreshComments: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useComments({
  fsNodeId,
  includeResolved = true,
}: UseCommentsOptions): UseCommentsReturn {
  const { session } = useAuth(); // Adjust based on your auth hook

  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!session?.access_token || !fsNodeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCommentsByNode(
        fsNodeId,
        session.access_token,
        includeResolved
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

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!session?.access_token || !fsNodeId) return;

    try {
      const response = await getCommentStats(fsNodeId, session.access_token);

      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch comment stats:", err);
    }
  }, [fsNodeId, session?.access_token]);

  // Add comment
  const addComment = useCallback(
    async (
      data: Omit<CreateCommentDto, "fs_node_id">
    ): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const response = await createComment(
          { ...data, fs_node_id: fsNodeId },
          session.access_token
        );

        if (response.success && response.data) {
          setComments((prev) => [...prev, response.data!]);
          await fetchStats(); // Refresh stats
          return response.data;
        } else {
          setError(response.error || "Failed to create comment");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [session?.access_token, fsNodeId, fetchStats]
  );

  // Edit comment
  const editComment = useCallback(
    async (
      commentId: string,
      data: UpdateCommentDto
    ): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const response = await updateComment(
          commentId,
          data,
          session.access_token
        );

        if (response.success && response.data) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? response.data! : comment
            )
          );
          await fetchStats(); // Refresh stats if resolution status changed
          return response.data;
        } else {
          setError(response.error || "Failed to update comment");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [session?.access_token, fetchStats]
  );

  // Remove comment
  const removeComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!session?.access_token) return false;

      try {
        const response = await deleteComment(commentId, session.access_token);

        if (response.success) {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
          await fetchStats(); // Refresh stats
          return true;
        } else {
          setError(response.error || "Failed to delete comment");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [session?.access_token, fetchStats]
  );

  // Toggle resolve status
  const toggleResolve = useCallback(
    async (
      commentId: string,
      isResolved: boolean
    ): Promise<CommentResponse | null> => {
      if (!session?.access_token) return null;

      try {
        const response = isResolved
          ? await resolveComment(commentId, session.access_token)
          : await unresolveComment(commentId, session.access_token);

        if (response.success && response.data) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? response.data! : comment
            )
          );
          await fetchStats(); // Refresh stats
          return response.data;
        } else {
          setError(response.error || "Failed to update comment status");
          return null;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [session?.access_token, fetchStats]
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
