import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";
import { getUserFromCookie } from "@/lib/utils/get-user";
import WorkspaceHeader from "@/components/workspace-layout/workspace-header";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
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

  const { title, error } = await fetchProjectTitle(projectId);

  if (error || !title) {
    return <ErrorMsg message="Failed to load project data." />;
  }

  return (
    <div>
      <div className="sticky top-0 z-50">
        <WorkspaceHeader projectId={projectId} projectTitle={title} />
      </div>
      <main className="mt-17">{children}</main>
    </div>
  );
};

export default WorkspaceLayout;
