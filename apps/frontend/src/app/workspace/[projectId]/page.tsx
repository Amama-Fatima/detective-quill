import ProjectWorkspaceHeader from "@/components/project-workspace/project-workspace-header";
import WorkspaceMainBody from "@/components/project-workspace/project-workspace-main";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";
interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectWorkspace = async ({ params }: ProjectWorkspacePageProps) => {
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

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    // .eq("author_id", user.id)
    .single();

  return (
    <div>
      <ProjectWorkspaceHeader project={data} />
      <WorkspaceMainBody project={data} />
    </div>
  );
};

export default ProjectWorkspace;
