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
    code: string;
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

  const email = await searchParams?.email;
  const projectTitle = await searchParams?.projectTitle;
  const code = await searchParams?.code;
  const { projectId } = await params;
  const query = new URLSearchParams(
    Object.entries(searchParams ?? {}).filter(([, v]) => v != null) as any
  ).toString();
  const callbackUrl = `/workspace/${projectId}/accept-invite${
    query ? `?${query}` : ""
  }`;

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(callbackUrl)}`);
  }

  // Ensure the email in query matches the authenticated user's email
  if (user?.email !== email) {
    // first log user out then redirect to sign-in
    await supabase.auth.signOut();
    redirect(`/auth/sign-in?redirectTo=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div>
      <AcceptRejectProject
        projectId={projectId}
        projectTitle={projectTitle}
        code={code}
      />
    </div>
  );
}
