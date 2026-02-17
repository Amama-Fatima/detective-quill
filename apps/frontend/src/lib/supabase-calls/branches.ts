import { createSupabaseServerClient } from "@/supabase/server-client";

import { Branch } from "@detective-quill/shared-types";

export async function getBranchesOfProject(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{ branches: Branch[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("project_id", projectId);
  return { branches: data, error: error ? error.message : null };
}
