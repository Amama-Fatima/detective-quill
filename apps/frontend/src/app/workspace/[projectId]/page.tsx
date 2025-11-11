import WorkspaceMainBody from "@/components/project-workspace/project-workspace-main";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import React from "react";
import { getProjectMembers } from "@/lib/supabase-calls/members";
import ErrorMsg from "@/components/error-msg";
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

  let { members, error: membersError } = await getProjectMembers(
    projectId,
    user.id
  );

  if (membersError) {
    console.error("Error fetching project members:", membersError);
    members = [];
  }

  return (
    <div>
      <WorkspaceMainBody
        project={data}
        userId={user.id}
        members={members || []}
      />
    </div>
  );
};

export default ProjectWorkspace;
