// import { useQuery } from "@tanstack/react-query";
// import { useAuth } from "@/context/auth-context";
// import { getEditorWorkspaceData } from "@/lib/backend-calls/fs-nodes";

// export function useActiveBranchId(projectId: string | null) {
//   const { session } = useAuth();
//   const accessToken = session?.access_token ?? "";

//   const { data: activeBranchId, isLoading } = useQuery({
//     queryKey: ["workspace-active-branch", projectId],
//     queryFn: async () => {
//       if (!projectId || !accessToken) return null;
//       const response = await getEditorWorkspaceData(projectId, accessToken);
//       if (!response.success || !response.data) return null;
//       return response.data.activeBranchId ?? null;
//     },
//     enabled: !!projectId && !!accessToken,
//   });

//   return { activeBranchId: activeBranchId ?? null, isLoading };
// }
