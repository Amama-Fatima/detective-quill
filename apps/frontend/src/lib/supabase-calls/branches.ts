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