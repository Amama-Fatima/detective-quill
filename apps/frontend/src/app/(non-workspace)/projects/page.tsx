import { redirect } from "next/navigation";
import UserProjectsPage from "@/components/projects/user-projects-page";
import { createSupabaseServerClient } from "@/supabase/server-client";
import {
  getUserProjects,
  getInvitedProjects,
} from "@/lib/supabase-calls/user-projects";
import ErrorMsg from "@/components/error-msg";
import { getUserFromCookie } from "@/lib/utils/get-user";

export const metadata = {
  title: "My Projects",
};

export default async function CasesPage() {
  const supabase = await createSupabaseServerClient();

  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const [
    { projects, error: projectsError },
    { projects: invitedProjects, error: invitedError },
  ] = await Promise.all([
    getUserProjects(user.sub, supabase),
    getInvitedProjects(user.sub, supabase),
  ]);

  const errorMessage = projectsError
  ? "Failed to load projects"
  : invitedError
  ? "Failed to load invited projects"
  : null;

if (errorMessage) {
  return <ErrorMsg message={errorMessage} />;
}
  return (
    <UserProjectsPage
      initialProjects={projects || []}
      invitedProjects={invitedProjects || []}
    />
  );
}
