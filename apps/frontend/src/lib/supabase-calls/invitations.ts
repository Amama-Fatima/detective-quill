import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Invitation } from "@detective-quill/shared-types";
export async function getProjectInvitations(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ invitations: Invitation[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    console.error("Supabase error fetching invitations:", error);
    return { invitations: null, error: error.message };
  }
  return { invitations: data as Invitation[], error: null };
}
