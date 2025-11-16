import { ProjectMember } from "@detective-quill/shared-types";
import { createSupabaseServerClient } from "@/supabase/server-client";

export async function getProjectMembers(
  projectId: string,
  userId: string
): Promise<{ members: ProjectMember[] | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const isMember = await verifyMembership(projectId, userId, supabase);
    if (!isMember) {
      throw new Error("User is not authorized to view project members");
    }

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
      throw new Error(`Failed to fetch project members: ${error.message}`);
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
  } catch (err) {
    console.error(err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error fetching project members";
    return { members: null, error: msg };
  }
}

async function verifyMembership(
  projectId: string,
  userId: string,
  supabase: any
): Promise<boolean> {
  try {
    const { data: member, error: memberError } = await supabase
      .from("projects_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
    if (member) {
      return true;
    }

    if (memberError) {
      console.error("Supabase error verifying membership:", memberError);
      throw new Error(`Failed to verify membership: ${memberError?.message}`);
    }
    return false;
  } catch (error) {
    return false;
  }
}
