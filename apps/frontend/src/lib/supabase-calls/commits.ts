import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Commit } from "@detective-quill/shared-types";

// get commits for a branch
export async function getBranchCommits(
  branchId: string,
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{
  commits: Pick<
    Commit,
    "branch_id" | "id" | "message" | "created_at" | "project_id"
  >[];
  error: string | null;
}> {
  const { data, error } = await supabase

    .from("commits")
    .select("branch_id, id, message, created_at, project_id")
    .eq("branch_id", branchId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return { commits: [], error: error.message };
  }

  return { commits: data || [], error: null };
}
