import WorkspaceMainBody from "@/components/project-page/project-workspace-main";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect, notFound } from "next/navigation";
import React from "react";
import {
  getProjectMembers,
  verifyMembership,
} from "@/lib/supabase-calls/members";
import ErrorMsg from "@/components/error-msg";
import { getProjectInvitations } from "@/lib/supabase-calls/invitations";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { Branch } from "@detective-quill/shared-types";

interface ProjectWorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

const ProjectWorkspace = async ({ params }: ProjectWorkspacePageProps) => {
  const supabase = await createSupabaseServerClient();

  const { projectId } = await params;

  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    // .eq("author_id", user.id)
    .single();

  if (error || !data) {
    return <ErrorMsg message="Project not found" />;
  }

  const isMember = await verifyMembership(projectId, user.sub, supabase);
  if (!isMember) {
    return notFound();
  }

  let { members, error: membersError } = await getProjectMembers(
    projectId,
    supabase,
  );

  let { invitations, error: invitationsError } = await getProjectInvitations(
    projectId,
    supabase,
  );

  if (membersError) {
    console.error("Error fetching project members:", membersError);
    members = [];
  }

  if (invitationsError) {
    console.error("Error fetching project invitations:", invitationsError);
    invitations = [];
  }

  let { branches, error: branchesError } = await getBranchesOfProject(
    projectId,
    supabase,
  );

  if (branchesError) {
    console.error("Error fetching branches:", branchesError);
    branches = [];
  }

  const activeBranch = branches?.find((branch: Branch) => branch.is_active);
  const numBranches = branches?.length || 0;

  return (
    <div>
      <WorkspaceMainBody
        project={data}
        userId={user.sub}
        members={members || []}
        invitations={invitations || []}
        numBranches={numBranches}
        activeBranch={activeBranch ?? null}
      />
    </div>
  );
};

export default ProjectWorkspace;
