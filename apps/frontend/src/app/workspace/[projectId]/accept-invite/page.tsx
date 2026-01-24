import AcceptRejectProject from "@/components/project-page/accept-reject-project";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Promise<Metadata> {
  const { projectId } = params;
  const { title, error } = await fetchProjectTitle(projectId);
  if (error || !title) {
    return {
      title: "Accept Invite",
      description: "Project Accept Invite page",
    };
  }
  return {
    title: `${title} - Accept Invite`,
    description: `Accept invite page for project ${title}`,
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
    Object.entries(searchParams ?? {}).filter(([, v]) => v != null) as any,
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
