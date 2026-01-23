import { ProjectMember } from "@detective-quill/shared-types";
import { createSupabaseServerClient } from "@/supabase/server-client";

export async function getProjectMembers(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ members: ProjectMember[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("projects_members")
    .select(
      `
        user_id,
        created_at,
        is_author,
        profile:profiles!projects_members_user_id_fkey (
          user_id,
          full_name,
          username,
          email,
          avatar_url
        )
      `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase error fetching project members:", error);
    return { members: null, error: error.message };
  }

  const members = data?.map((member) => {
    const profile = Array.isArray(member.profile)
      ? member.profile[0]
      : member.profile;
    return {
      user_id: member.user_id,
      full_name: profile?.full_name ?? profile?.username ?? null,
      user_name: profile?.username ?? null,
      email: profile?.email,
      avatar: profile?.avatar_url ?? null,
      created_at: member.created_at,
      is_author: member.is_author,
    };
  });

  return { members: members as unknown as ProjectMember[], error: null };
}

export async function verifyMembership(
  projectId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects_members")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase error verifying membership:", error);
    return false;
  }

  return !!data;
}
