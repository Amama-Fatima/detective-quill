import AcceptRejectProject from "@/components/project-workspace/accept-reject-project";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";

interface AcceptInvitePageProps {
  params: {
    projectId: string;
  };
  searchParams: {
    email: string;
    projectTitle: string;
    inviteCode: string;
  };
}

export default async function AcceptInvitePage({
  params,
  searchParams,
}: AcceptInvitePageProps) {
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
  const { projectId } = await params;
  const email = await searchParams?.email;
  const projectTitle = await searchParams?.projectTitle;
  const inviteCode = await searchParams?.inviteCode;

  // Ensure the email in query matches the authenticated user's email
  if (user.email !== email) {
    redirect("/auth/sign-in");
  }

  return (
    <div>
      <AcceptRejectProject
        projectId={projectId}
        projectTitle={projectTitle}
        inviteCode={inviteCode}
      />
    </div>
  );
}
