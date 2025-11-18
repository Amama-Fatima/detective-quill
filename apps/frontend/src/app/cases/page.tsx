import { redirect } from "next/navigation";
import { ProjectsPageClient } from "@/components/projects/project-page-client";
import { createSupabaseServerClient } from "@/supabase/server-client";
import {
  getUserProjects,
  getInvitedProjects,
} from "@/lib/supabase-calls/user-projects";
import ErrorMsg from "@/components/error-msg";

export const metadata = {
  title: "My Cases",
};

export default async function CasesPage() {
  const supabase = await createSupabaseServerClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  const { projects, error } = await getUserProjects(user.id, supabase);
  const { projects: invitedProjects, error: invitedError } =
    await getInvitedProjects(user.id, supabase);

  if (error) {
    return <ErrorMsg message="Failed to load projects" />;
  }

  if (invitedError) {
    return <ErrorMsg message="Failed to load invited projects" />;
  }

  return (
    <ProjectsPageClient
      user={user}
      initialProjects={projects || []}
      invitedProjects={invitedProjects || []}
    />
  );
}
