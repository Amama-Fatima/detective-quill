import { CreateCommitDto, ApiResponse } from "@detective-quill/shared-types";
import { createCommit } from "@/lib/backend-calls/commits";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";


export function useCommits(projectId: string): {
  createCommitMutation: UseMutationResult<
    ApiResponse,
    Error,
    CreateCommitDto
  >;
} {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token || "";


    const createCommitMutation = useMutation({
    mutationFn: async (data: CreateCommitDto) => {
        return await createCommit(projectId, data, accessToken);
    },
    onSuccess: () => {
        toast.success("Commit created successfully");
        // queryClient.invalidateQueries({ queryKey: ["commits", projectId] });
    },
    onError: (error: Error) => {
        toast.error(`Failed to create commit: ${error.message}`);
    },
    });

    return {
        createCommitMutation,
    };
}
