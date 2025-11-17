import { createSupabaseServerClient } from "@/supabase/server-client";
import { Project } from "@detective-quill/shared-types";

export async function getUserProjects(
  userId: string
): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }

    return { projects: projects || [], error: null };
  } catch (err) {
    console.error("Error in getUserProjects:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error fetching user projects";
    return { projects: [], error: msg };
  }
}

export async function getInvitedProjects(
  userId: string
): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: memberRows, error } = await supabase
      .from("projects_members")
      .select("project:project_id (*)")
      .eq("user_id", userId)
      .eq("is_author", false);

    if (error) {
      throw new Error(`Failed to get invited projects: ${error.message}`);
    }

    const filtered = memberRows.filter((row) => row.project !== null) || [];
    const projects = filtered.map((row) => row.project);

    return { projects: (projects as unknown as Project[]) || [], error: null };
  } catch (err) {
    console.error("Error in getInvitedProjects:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error fetching invited projects";
    return { projects: [], error: msg };
  }
}
