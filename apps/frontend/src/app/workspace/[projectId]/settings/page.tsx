import ProjectWorkspaceHeader from "@/components/project-workspace/project-workspace-header";
import ProjectSettingsBody from "@/components/project-workspace/settings/settings-body";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { ProjectMember } from "@detective-quill/shared-types";
import { redirect } from "next/navigation";
import React from "react";

// Define the member interface to match backend response

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

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    redirect("/projects"); // Redirect if project not found
  }

  // Check if user has access to this project (either owner or member)
  const isOwner = project.author_id === user.id;

  if (!isOwner) {
    // Check if user is a member
    const { data: memberCheck } = await supabase
      .from("projects_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("member_id", user.id)
      .single();

    if (!memberCheck) {
      redirect("/projects"); // User has no access to this project
    }
  }

  // Fetch project members with their profile information
  const { data: members, error: membersError } = await supabase
    .from("projects_members")
    .select(
      `
    project_id,
    user_id,
    created_at,
    profiles!projects_members_user_id_fkey (
      user_id,
      full_name,
      username,
      email,
      avatar_url
    )
  `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  console.log("members data is ", members);
  console.log("members error is ", membersError);
  // If members fetch fails, set empty array (component will handle the error)
  const projectMembers: ProjectMember[] =
    (members as unknown as ProjectMember[]) || [];

  return (
    <div>
      <ProjectSettingsBody
        project={project}
        initialMembers={projectMembers}
        currentUserId={user.id}
      />
    </div>
  );
};

export default ProjectSettingsPage;
