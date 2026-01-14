import { createSupabaseServerClient } from "@/supabase/server-client";
import { Project } from "@detective-quill/shared-types";

export async function getUserProjects(
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ projects: Project[]; error: string | null }> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { projects: [], error: error.message };
  }

  return { projects: projects || [], error: null };
}

export async function getInvitedProjects(
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ projects: Project[]; error: string | null }> {
  const { data: memberRows, error } = await supabase
    .from("projects_members")
    .select("project:project_id (*)")
    .eq("user_id", userId)
    .eq("is_author", false);

  if (error) {
    return { projects: [], error: error.message };
  }

  const filtered = memberRows.filter((row) => row.project !== null) || [];
  const projects = filtered.map((row) => row.project);

  return { projects: (projects as unknown as Project[]) || [], error: null };
}

export async function getProjectStatusAndAuthor(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{
  isActive: boolean;
  author_id: string | null;
  error: string | null;
}> {
  const { data: project, error } = await supabase
    .from("projects")
    .select("status, author_id")
    .eq("id", projectId)
    .single();
  if (error || !project) {
    return {
      isActive: false,
      author_id: null,
      error: error ? error.message : "Project not found",
    };
  }
  return {
    isActive: project.status === "active",
    author_id: project.author_id,
    error: null,
  };
}
