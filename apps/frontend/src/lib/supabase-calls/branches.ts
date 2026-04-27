import { createSupabaseServerClient } from "@/supabase/server-client";
import { Branch } from "@detective-quill/shared-types";

export type BranchWithParent = Branch & { parent_branch_id: string | null };

export async function getBranchesOfProject(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ branches: Branch[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return { branches: data, error: error ? error.message : null };
}

export async function getBranchesWithParent(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ branches: BranchWithParent[] | null; error: string | null }> {
  const { data: branches, error: branchError } = await supabase
    .from("branches")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (branchError) {
    return { branches: null, error: branchError.message };
  }

  if (!branches || branches.length === 0) {
    return { branches: [], error: null };
  }

  const parentCommitIds = branches
    .map((b) => b.parent_commit_id)
    .filter(Boolean) as string[];

  if (parentCommitIds.length === 0) {
    return {
      branches: branches.map((b) => ({ ...b, parent_branch_id: null })),
      error: null,
    };
  }

  const { data: commits, error: commitError } = await supabase
    .from("commits")
    .select("id, branch_id")
    .in("id", parentCommitIds);

  if (commitError) {
    return { branches: null, error: commitError.message };
  }

  const commitToBranch = new Map<string, string>();
  for (const commit of commits ?? []) {
    if (commit.branch_id) {
      commitToBranch.set(commit.id, commit.branch_id);
    }
  }

  return {
    branches: branches.map((b) => ({
      ...b,
      parent_branch_id: b.parent_commit_id
        ? (commitToBranch.get(b.parent_commit_id) ?? null)
        : null,
    })),
    error: null,
  };
}

export async function getActiveBranchId(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("branches")
    .select("id, is_active, project_id")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function getHeadCommitId(
  branchId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ head_commit_id: string; id: string } | null> {
  const { data, error } = await supabase
    .from("branches")
    .select("id, head_commit_id")
    .eq("id", branchId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getNumberOfBranches(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<number> {
  const { data, error } = await supabase
    .from("branches")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) {
    console.error("Error counting branches:", error);
    return 0;
  }

  return data?.length || 0;
}

export async function getBranchById(
  branchId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ branch: Branch | null; error: string | null }> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", branchId)
    .single();

  if (error || !data) {
    return { branch: null, error: error ? error.message : "Branch not found" };
  }

  return { branch: data, error: null };
}