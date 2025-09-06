import ProjectWorkspaceHeader from "@/components/project-workspace/project-workspace-header";
import ProjectSettingsBody from "@/components/project-workspace/settings/settings-body";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";

interface ProjectSettingsPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectSettingsPage = async ({ params }: ProjectSettingsPageProps) => {
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
    .single();

  return (
    <div>
      <ProjectSettingsBody project={data} />
    </div>
  );
};

export default ProjectSettingsPage;
