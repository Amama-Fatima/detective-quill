import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";
import { getUserFromCookie } from "@/lib/utils/get-user";

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
  console.log("LAYOUT");

  const { projectId } = await params;

  const user = await getUserFromCookie();
  console.log("user in workspace layout:", user);

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const { title, error } = await fetchProjectTitle(projectId);

  if (error || !title) {
    return <ErrorMsg message="Failed to load project data." />;
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-background to-card border-b border-border">
        <h1 className="mystery-title text-center text-4xl mb-2">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default WorkspaceLayout;
