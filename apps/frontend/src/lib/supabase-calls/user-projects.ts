import { createSupabaseServerClient } from "@/supabase/server-client";
import { Project } from "@detective-quill/shared-types";
import { th } from "zod/v4/locales";

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
