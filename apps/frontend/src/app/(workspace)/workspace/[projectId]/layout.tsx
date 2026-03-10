import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";
import { getUserFromCookie } from "@/lib/utils/get-user";
import WorkspaceHeader from "@/components/workspace-layout/workspace-header";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { verifyMembership } from "@/lib/supabase-calls/members";
import { WorkspaceContextProvider } from "@/context/workspace-context";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { fetchActiveBranchId } from "@/lib/supabase-calls/editor-workspace";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
  children: React.ReactNode;
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
      title: "Workspace",
      description: "Project workspace",
    };
  }
  return {
    title: `${title} - Workspace`,
    description: `Workspace for project ${title}`,
  };
}
const WorkspaceLayout = async ({
  params,
  children,
}: ProjectWorkspacePageProps) => {
  const { projectId } = await params;

  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const supabase = await createSupabaseServerClient();

  // Running both in parallel
  const [{ title, error }, isMember, { isActive, author_id }, activeBranchId] =
    await Promise.all([
      fetchProjectTitle(projectId),
      verifyMembership(projectId, user.sub, supabase),
      getProjectStatusAndAuthor(projectId, supabase),
      fetchActiveBranchId(supabase, projectId),
    ]);

  if (error || !title) {
    return <ErrorMsg message="Failed to load project data." />;
  }

  if (!isMember) {
    return <ErrorMsg message="You don't have access to this project." />;
  }

  const isOwner = author_id === user.sub;

  return (
    <WorkspaceContextProvider
      projectId={projectId}
      activeBranchId={activeBranchId}
      isOwner={isOwner}
      isActive={isActive}
    >
      <div>
        <div className="sticky top-0 z-50">
          <WorkspaceHeader projectId={projectId} projectTitle={title} />
        </div>
        <main className="mt-14 md:mt-27 lg:mt-17">{children}</main>
      </div>
    </WorkspaceContextProvider>
  );
};

export default WorkspaceLayout;
