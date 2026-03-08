import { useAuth } from "@/context/auth-context";
import { revertToCommit } from "@/lib/backend-calls/commits";
import { requireAccessToken } from "@/lib/utils/utils";
import { useMutation } from "@tanstack/react-query";
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
  const accessToken = session?.access_token ?? "";

  return useMutation({
    mutationFn: async () => {
      const token = requireAccessToken(accessToken);
      const response = await revertToCommit(projectId, commitId, token);

      if (!response.success) {
        throw new Error(response.error || "Failed to revert commit");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Revert job queued successfully.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to revert branch: ${error.message}`);
    },
  });
}
