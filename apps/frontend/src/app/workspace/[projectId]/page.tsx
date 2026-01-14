import WorkspaceMainBody from "@/components/project-workspace/project-workspace-main";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";
import {
  getProjectMembers,
  verifyMembership,
} from "@/lib/supabase-calls/members";
import ErrorMsg from "@/components/error-msg";
import { getProjectInvitations } from "@/lib/supabase-calls/invitations";
import { notFound } from "next/navigation";

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

  if (error || !data) {
    return <ErrorMsg message="Project not found" />;
  }

  const isMember = await verifyMembership(projectId, user.id, supabase);
  if (!isMember) {
    return notFound();
  }

  // console.log("Project data:", data, isMember);

  let { members, error: membersError } = await getProjectMembers(
    projectId,
    supabase
  );

  let { invitations, error: invitationsError } = await getProjectInvitations(
    projectId,
    supabase
  );

  if (membersError) {
    console.error("Error fetching project members:", membersError);
    members = [];
  }

  if (invitationsError) {
    console.error("Error fetching project invitations:", invitationsError);
    invitations = [];
  }

  return (
    <div>
      <WorkspaceMainBody
        project={data}
        userId={user.id}
        members={members || []}
        invitations={invitations || []}
      />
    </div>
  );
};

export default ProjectWorkspace;
