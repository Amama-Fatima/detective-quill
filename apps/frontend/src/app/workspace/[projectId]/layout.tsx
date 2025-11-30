import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata } from "next";

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
  const { projectId } = params;
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
  const supabase = await createSupabaseServerClient();

  const { projectId } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  const { title, error } = await fetchProjectTitle(projectId);

  if (error || !title) {
    return <ErrorMsg message="Failed to load project data." />;
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-background to-card border-b border-border

">
        <h1 className="mystery-title text-center text-4xl mb-2">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default WorkspaceLayout;
