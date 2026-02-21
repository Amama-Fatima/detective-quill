import {
  CreateCommitDto,
  ApiResponse,
  Commit,
} from "@detective-quill/shared-types";
import { createCommit } from "@/lib/backend-calls/commits";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";

const DEFAULT_PAGE_SIZE = 10;

export interface UseCommitsOptions {
  page?: number;
  limit?: number;
}

interface UseCommitsResult {
  // commits: Commit[] | undefined;
  // total: number;
  // totalPages: number;
  // page: number;
  // isLoading: boolean;
  createCommitMutation: UseMutationResult<
    ApiResponse<Commit>,
    Error,
    CreateCommitDto
  >;
}

export function useCommits(
  projectId: string,
  branchId: string | null,
  options?: UseCommitsOptions,
): UseCommitsResult {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const accessToken = session?.access_token || "";
  const page = options?.page ?? 1;
  const limit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const isPaginated = options !== undefined && options.page !== undefined;

  // const { data, isLoading } = useQuery({
  //   queryKey: [
  //     "commits",
  //     projectId,
  //     branchId,
  //     isPaginated ? page : "all",
  //     limit,
  //   ],
  //   queryFn: async () => {
  //     if (!branchId) return undefined;
  //     if (!accessToken) {
  //       throw new Error("Not authenticated");
  //     }
  //     if (isPaginated) {
  //       const response = await getCommitsByBranchPaginated(
  //         projectId,
  //         branchId,
  //         page,
  //         limit,
  //         accessToken,
  //       );

  //       if (!response.success || !response.data) {
  //         throw new Error(response.error || "Failed to fetch commits");
  //       }
  //       return response.data;
  //     }
  //     const response = await getCommitsByBranch(
  //       projectId,
  //       branchId,
  //       accessToken,
  //     );
  //     if (!response.success || !response.data) {
  //       throw new Error(response.error || "Failed to fetch commits");
  //     }
  //     return { data: response.data, total: response.data.length };
  //   },
  //   enabled: !!branchId && !!accessToken,
  // });

  const createCommitMutation = useMutation({
    mutationFn: async (payload: CreateCommitDto) => {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const response = await createCommit(projectId, payload, accessToken);
      return response;
    },
    onSuccess: () => {
      toast.success("Commit created successfully");
      // queryClient.invalidateQueries({
      //   queryKey: ["commits", projectId, branchId],
      // });
      // i am commenting out the invalidation because it is not needed since commits are being fetched on another page
    },
    onError: (error: Error) => {
      toast.error(`Failed to create commit: ${error.message}`);
    },
  });

  // const commits = data?.data;
  // const total = data?.total ?? 0;
  // const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    // commits,
    // total,
    // totalPages,
    // page,
    // isLoading,
    createCommitMutation,
  };
}
