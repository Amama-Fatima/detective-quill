import { useAuth } from "@/context/auth-context";
import { switchActiveBranch } from "@/lib/backend-calls/branches";
import { requireAccessToken } from "@/lib/utils/utils";
import { type CreateBranchFormValues } from "@/lib/schema";
import { createBranch } from "@/lib/backend-calls/branches";
import { CreateBranchDto } from "@detective-quill/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseBranchParams {
  projectId: string;
}

export function useBranch({ projectId }: UseBranchParams) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = session?.access_token ?? "";

  const createBranchMutation = useMutation({
    mutationFn: async ({
      values,
      parentCommitId,
    }: {
      values: CreateBranchFormValues;
      parentCommitId: string;
    }) => {
      const dto: CreateBranchDto = {
        name: values.name,
        is_default: values.is_default,
        parent_commit_id: parentCommitId,
      };
      return await createBranch(projectId, dto, accessToken);
    },
    onSuccess: () => {
      toast.success(`Branch created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create branch: ${error.message}`);
    },
  });

  const switchBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      const token = requireAccessToken(accessToken);
      const response = await switchActiveBranch(projectId, branchId, token);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to switch active branch");
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["branches", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-tree", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-active-branch", projectId],
      });
      toast.success(`Switched to branch \"${data.branch.name}\"`);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(`Failed to switch branch: ${error.message}`);
    },
  });
  return { switchBranchMutation, createBranchMutation };
}
