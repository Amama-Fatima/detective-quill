import WorkspaceMainBody from "@/components/workspace-overview/project-workspace-main";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { getProjectMembers } from "@/lib/supabase-calls/members";
import ErrorMsg from "@/components/error-msg";
import { getProjectInvitations } from "@/lib/supabase-calls/invitations";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { Branch } from "@detective-quill/shared-types";
import { getProjectById } from "@/lib/supabase-calls/editor-workspace";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectWorkspace = async ({ params }: ProjectWorkspacePageProps) => {
  const { projectId } = await params;
  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const supabase = await createSupabaseServerClient();

  const [
    { project, error: projectError },
    membersResult,
    invitationsResult,
    branchesResult,
  ] = await Promise.all([
    getProjectById(projectId, supabase),
    getProjectMembers(projectId, supabase),
    getProjectInvitations(projectId, supabase),
    getBranchesOfProject(projectId, supabase),
  ]);

  if (projectError) {
    return <ErrorMsg message="Error fetching project" />;
  }

  if (!project) {
    return notFound();
  }

  const members = membersResult.members || [];
  const invitations = invitationsResult.invitations || [];
  const branches = branchesResult.branches || [];
  const activeBranch = branches.find((b: Branch) => b.is_active) ?? null;
  const numBranches = branches.length;

  return (
    <WorkspaceMainBody
      project={project}
      userId={user.sub}
      members={members}
      invitations={invitations}
      numBranches={numBranches}
      activeBranch={activeBranch}
    />
  );
};

export default ProjectWorkspace;
