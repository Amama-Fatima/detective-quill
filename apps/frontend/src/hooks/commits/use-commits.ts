import {
  CreateCommitDto,
  ApiResponse,
  Commit,
} from "@detective-quill/shared-types";
import { createCommit } from "@/lib/backend-calls/commits";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export interface UseCommitsOptions {
  page?: number;
  limit?: number;
}

interface UseCommitsResult {
  createCommitMutation: UseMutationResult<
    ApiResponse<Commit>,
    Error,
    CreateCommitDto
  >;
}

export function useCommits(projectId: string): UseCommitsResult {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";

  const createCommitMutation = useMutation({
    mutationFn: async (payload: CreateCommitDto) => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const response = await createCommit(projectId, payload, accessToken);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Commit job queued successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create commit: ${error.message}`);
    },
  });

  return {
    createCommitMutation,
  };
}
