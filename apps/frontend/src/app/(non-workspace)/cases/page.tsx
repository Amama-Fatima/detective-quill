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
  title: "My Cases",
};

export default async function CasesPage() {
  const supabase = await createSupabaseServerClient();

  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }
  const { projects, error } = await getUserProjects(user.sub, supabase);
  const { projects: invitedProjects, error: invitedError } =
    await getInvitedProjects(user.sub, supabase);

  if (error) {
    return <ErrorMsg message="Failed to load projects" />;
  }

  if (invitedError) {
    return <ErrorMsg message="Failed to load invited projects" />;
  }

  return (
    <UserProjectsPage
      initialProjects={projects || []}
      invitedProjects={invitedProjects || []}
    />
  );
}
