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
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";

export interface UseCommentsOptions {
  fsNodeId: string;
  includeResolved?: boolean;
  projectId: string;
}

export interface UseCommentsReturn {
  comments: CommentResponse[];
  stats: CommentStats | null;
  isLoading: boolean;
  error: string | null;
  addCommentMutation: UseMutationResult<
    CommentResponse | undefined,
    Error,
    CreateCommentDto
  >;
  editCommentMutation: UseMutationResult<
    CommentResponse | undefined,
    Error,
    { commentId: string; data: UpdateCommentDto }
  >;
  removeCommentMutation: UseMutationResult<string, Error, string>;
  toggleResolveMutation: UseMutationResult<
    CommentResponse | undefined,
    Error,
    string
  >;
}

export function useComments({
  fsNodeId,
  includeResolved = true,
  projectId,
}: UseCommentsOptions): UseCommentsReturn {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token || "";

  // Fetch comments
  const {
    data: comments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = useQuery({
    queryKey: ["comments", projectId, fsNodeId, includeResolved],
    queryFn: async () => {
      if (!accessToken || !fsNodeId) return [];
      const response = await getCommentsByNode(
        projectId,
        fsNodeId,
        accessToken,
        includeResolved,
      );
      return response.success && response.data ? response.data : [];
    },
    enabled: !!accessToken && !!fsNodeId,
  });

  // Fetch stats
  const { data: stats = null, isLoading: statsLoading } = useQuery({
    queryKey: ["commentStats", projectId, fsNodeId],
    queryFn: async () => {
      if (!accessToken || !fsNodeId) return null;
      const response = await getCommentStats(projectId, fsNodeId, accessToken);
      return response.success && response.data ? response.data : null;
    },
    enabled: !!accessToken && !!fsNodeId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      const response = await createComment(data, accessToken);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (newComment) => {
      // Update comments list
      queryClient.setQueryData(
        ["comments", projectId, fsNodeId, includeResolved],
        (old: CommentResponse[]) => [...(old || []), newComment],
      );
      // Update stats
      queryClient.setQueryData(
        ["commentStats", projectId, fsNodeId],
        (old: CommentStats | null) => {
          if (!old) return { total: 1, resolved: 0, unresolved: 1 };
          return {
            total: old.total + 1,
            resolved: old.resolved,
            unresolved: old.unresolved + 1,
          };
        },
      );
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment",
      );
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentDto;
    }) => {
      const response = await updateComment(
        projectId,
        commentId,
        data,
        accessToken,
      );
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (updatedComment) => {
      if (!updatedComment) return;
      queryClient.setQueryData(
        ["comments", projectId, fsNodeId, includeResolved],
        (old: CommentResponse[]) =>
          (old || []).map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment,
          ),
      );
      toast.success("Comment edited successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to edit comment",
      );
    },
  });

  // Remove comment mutation
  const removeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await deleteComment(projectId, commentId, accessToken);
      if (!response.success) throw new Error(response.error);
      return commentId;
    },
    onSuccess: (commentId) => {
      // Get the comment to check if it was resolved
      const comment = comments.find((c) => c.id === commentId);
      const wasResolved = comment?.is_resolved || false;

      queryClient.setQueryData(
        ["comments", projectId, fsNodeId, includeResolved],
        (old: CommentResponse[]) =>
          (old || []).filter((comment) => comment.id !== commentId),
      );

      queryClient.setQueryData(
        ["commentStats", projectId, fsNodeId],
        (old: CommentStats | null) => {
          if (!old) return old;
          return {
            total: old.total - 1,
            resolved: wasResolved ? old.resolved - 1 : old.resolved,
            unresolved: wasResolved ? old.unresolved : old.unresolved - 1,
          };
        },
      );
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment",
      );
    },
  });

  // Resolve comment mutation
  const toggleResolveMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await resolveComment(projectId, commentId, accessToken);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (resolvedComment) => {
      if (!resolvedComment) return;
      queryClient.setQueryData(
        ["comments", projectId, fsNodeId, includeResolved],
        (old: CommentResponse[]) =>
          (old || []).map((comment) =>
            comment.id === resolvedComment.id ? resolvedComment : comment,
          ),
      );

      queryClient.setQueryData(
        ["commentStats", projectId, fsNodeId],
        (old: CommentStats | null) => {
          if (!old) return old;
          const isNowResolved = resolvedComment.is_resolved;
          return {
            total: old.total,
            resolved: isNowResolved ? old.resolved + 1 : old.resolved - 1,
            unresolved: isNowResolved ? old.unresolved - 1 : old.unresolved + 1,
          };
        },
      );
      toast.success("Comment resolved successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve comment",
      );
    },
  });

  return {
    comments,
    stats,
    isLoading: commentsLoading || statsLoading,
    error: commentsError instanceof Error ? commentsError.message : null,
    addCommentMutation,
    editCommentMutation,
    removeCommentMutation,
    toggleResolveMutation,
  };
}
