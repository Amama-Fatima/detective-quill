import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Invitation } from "@detective-quill/shared-types";
export async function getProjectInvitations(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ invitations: Invitation[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error("Supabase error fetching invitations:", error);
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }
    return { invitations: data as Invitation[], error: null };
  } catch (err) {
    console.error(err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error fetching project invitations";
    return { invitations: null, error: msg };
  }
}
