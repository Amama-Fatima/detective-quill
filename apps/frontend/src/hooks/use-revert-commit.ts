import { useAuth } from "@/context/auth-context";
import { revertToCommit } from "@/lib/backend-calls/commits";
import { requireAccessToken } from "@/lib/utils/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseRevertCommitParams {
  projectId: string;
  commitId: string;
}

export function useRevertCommit({
  projectId,
  commitId,
}: UseRevertCommitParams) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token ?? "";

  return useMutation({
    mutationFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await revertToCommit(projectId, commitId, token);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to revert commit");
      }

      return response.data;
    },
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: ["commits", projectId] });
    //   queryClient.invalidateQueries({
    //     queryKey: ["workspace-active-branch", projectId],
    //   });

      if (data.deletedCommitsCount > 0) {
        toast.success(
          `Reverted branch and removed ${data.deletedCommitsCount} newer commit(s).`,
        );
        return;
      }

      toast.success("Branch already pointed to this commit.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to revert branch: ${error.message}`);
    },
  });
}
