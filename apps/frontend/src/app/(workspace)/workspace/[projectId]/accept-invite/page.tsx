import AcceptRejectProject from "@/components/project-page/invitations/accept-reject-project";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface AcceptInvitePageProps {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    email: string;
    projectTitle: string;
    code: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
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
  const user = await getUserFromCookie();
  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  const email = resolvedSearchParams.email;
  const projectTitle = resolvedSearchParams.projectTitle;
  const code = resolvedSearchParams.code;
  const query = new URLSearchParams(
    Object.entries(resolvedSearchParams ?? {}).filter(
      ([, v]) => v != null,
    ) as any,
  ).toString();
  const callbackUrl = `/workspace/${projectId}/accept-invite${
    query ? `?${query}` : ""
  }`;

  if (!user || !user.sub) {
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
