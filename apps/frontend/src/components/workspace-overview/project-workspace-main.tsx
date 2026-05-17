"use client";

import { Project, ProjectMember, Invitation, Branch } from "@detective-quill/shared-types";
import { useWorkspaceSync } from "@/hooks/use-workspace-sync";
import WorkspaceStats from "./workspace-stats";
// import DynamicMembersSection from "./members/dynamic-members-section";
// import DynamicPendingInvitations from "./invitations/dynamic-pending-invitations";
import WorkspaceActions from "./workspace-overview-actions";
import WorkspaceOverviewHeader from "./workspace-overview-header";
import ProjectMembers from "./members/project-members";
import PendingInvitations from "./invitations/pending-invitations";



interface WorkspaceMainBodyProps {
  project: Project;
  userId: string;
  members: ProjectMember[] | [];
  invitations: Invitation[] | [];
  numBranches: number;
  activeBranch: Branch | null;
}

export default function WorkspaceMainBody({
  project,
  userId,
  members,
  invitations,
  numBranches,
  activeBranch,
}: WorkspaceMainBodyProps) {
  const isOwner = userId === project.author_id;
  const isActive = project.status === "active";

  useWorkspaceSync(invitations, members);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />

      <div className="pointer-events-none absolute top-[35%] -right-7.5 w-25 h-25 rounded-full bg-accent opacity-60 z-1 border border-border/50" />
      <div className="pointer-events-none absolute bottom-[20%] -left-5 w-32.5 h-32.5 rounded-full bg-accent opacity-60 z-1 border border-border/50" />
      <div className="pointer-events-none absolute -bottom-7.5 right-[25%] w-22.5 h-22.5 rounded-full bg-accent opacity-60 z-1 border border-border/50" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
 
        <WorkspaceOverviewHeader project={project} /> 

        <WorkspaceStats
          project={project}
          members={members}
          numBranches={numBranches}
          activeBranch={activeBranch}
        />

        {isOwner && (
          <WorkspaceActions
            projectId={project.id}
            status={project.status}
            isActive={isActive}
          />
        )}

        <ProjectMembers
          isOwner={isOwner}
          initialMembers={members}
          projectId={project.id}
          userId={userId}
          isActive={isActive}
        />

        {isOwner && isActive && (
          <PendingInvitations projectId={project.id} />
        )}
      </div>
    </div>
  );
}