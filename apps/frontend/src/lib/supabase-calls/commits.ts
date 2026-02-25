import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Commit } from "@detective-quill/shared-types";
import { getHeadCommitId } from "./branches";

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
  const branchWithHead = await getHeadCommitId(branchId, supabase);

  if (!branchWithHead) {
    return { commits: [], error: null };
  }

  const { data, error } = await supabase
    .from("commits")
    .select("branch_id, id, message, created_at, project_id, parent_commit_id")
    .eq("project_id", projectId);

  if (error) {
    return { commits: [], error: error.message };
  }

  const commitsById = new Map(
    (data || []).map((commit) => [commit.id, commit]),
  );

  const commits: Pick<
    Commit,
    "branch_id" | "id" | "message" | "created_at" | "project_id"
  >[] = [];
  const visited = new Set<string>();
  let currentCommitId: string | null = branchWithHead.head_commit_id;

  while (currentCommitId && !visited.has(currentCommitId)) {
    visited.add(currentCommitId);
    const commit = commitsById.get(currentCommitId);

    if (!commit) {
      break;
    }

    commits.push({
      id: commit.id,
      branch_id: commit.branch_id,
      message: commit.message,
      created_at: commit.created_at,
      project_id: commit.project_id,
    });

    currentCommitId = commit.parent_commit_id;
  }

  return { commits, error: null };
}

export async function getCommitById(
  commitId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{
  commit: Commit | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("commits")
    .select("*")
    .eq("id", commitId)
    .single();

  if (error || !data) {
    return { commit: null, error: error?.message || "Commit not found" };
  }

  return { commit: data, error: null };
}
