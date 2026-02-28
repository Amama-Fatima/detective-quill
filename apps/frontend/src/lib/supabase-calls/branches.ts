import { createSupabaseServerClient } from "@/supabase/server-client";

import { Branch } from "@detective-quill/shared-types";

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

  if (error || !data) {
    return null;
  }

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

  if (error || !data) {
    return null;
  }

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
