"use client";

import { useState, useEffect } from "react";
import { Clock, GitBranch, Users, Mail } from "lucide-react";
import ChangeStateDropDown from "./change-state-dropdown";
import InviteMembersDialog from "./members/invite-memebers-dialog";
import {
  Project,
  ProjectMember,
  Invitation,
  Branch,
} from "@detective-quill/shared-types";
import MembersTable from "./members/members-table";
import PendingInvitations from "./members/pending-invitations";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";

interface WorkspaceMainBodyProps {
  project: Project;
  userId: string;
  members: ProjectMember[] | [];
  invitations: Invitation[] | [];
  branches: Branch[];
  activeBranch: Branch | null;
}

export default function WorkspaceMainBody({
  project,
  userId,
  members,
  invitations,
  branches,
  activeBranch,
}: WorkspaceMainBodyProps) {
  const isOwner = userId === project.author_id;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { setInvitations, setNotAllowedEmails } = useBetaReaderEmailsStore();
  const invitedEmails = invitations.map((inv) => inv.email);
  const memberEmails = members.map((member) => member.email);

  useEffect(() => {
    // Read current store state (zustand hook exposes getState)
    const storeState = useBetaReaderEmailsStore.getState();
    const prevInvitations = storeState.invitations || [];
    const prevNotAllowed = storeState.notAllowedEmails || [];

    const nextInvitations = invitations || [];
    const prevInvKeys = prevInvitations
      .map((p) => p.invite_code ?? p.email)
      .sort()
      .join(",");
    const nextInvKeys = nextInvitations
      .map((p) => p.invite_code ?? p.email)
      .sort()
      .join(",");
    if (prevInvKeys !== nextInvKeys) {
      setInvitations(nextInvitations);
    }

    const nextNotAllowed = [...invitedEmails, ...memberEmails];
    const prevNotAllowedJoined = prevNotAllowed.slice().sort().join(",");
    const nextNotAllowedJoined = nextNotAllowed.slice().sort().join(",");
    if (prevNotAllowedJoined !== nextNotAllowedJoined) {
      setNotAllowedEmails(nextNotAllowed);
    }
  }, [invitations, members, setInvitations, setNotAllowedEmails]);

  const isActive = project.status === "active";

  const currentBranchLabel = activeBranch?.name ?? "No active branch";
  const statusLabel =
    project.status.charAt(0).toUpperCase() + project.status.slice(1);

  return (
    <div className="mx-auto min-h-[80vh] w-full max-w-7xl px-4 py-6 md:px-6">
      <section className="mb-8 rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-background p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Case Workspace
              </span>
              <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-secondary-foreground">
                {statusLabel}
              </span>
            </div>

            <h4 className="mystery-title text-2xl md:text-3xl">Case Summary</h4>
            <p className="noir-text text-[1.05rem] leading-relaxed text-foreground/90">
              {project.description ??
                "This section provides an overview and notes for the ongoing project. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                <Clock className="h-4 w-4" />
                Updated: {project.updated_at ?? "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                <Users className="h-4 w-4" />
                {members.length} Members
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform ">
                <Mail className="h-4 w-4" />
                {invitations.length} Pending Invites
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                <GitBranch className="h-4 w-4" />
                {branches.length} Branches
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm lg:w-auto lg:min-w-[20rem]">
            <div className="mb-4">
              <span className="text-[0.8rem] uppercase tracking-tight text-muted-foreground">
                Current Branch
              </span>
              <div className="ml-3 hover:-translate-y-0.5 transition-transform inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-md font-medium text-secondary-foreground shadow-sm">
                <GitBranch className="h-3.5 w-3.5" />
                <span className="truncate max-w-[14rem]">
                  {currentBranchLabel}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <ChangeStateDropDown
                  projectId={project.id}
                  status={project.status}
                />
                {isActive && (
                  <InviteMembersDialog
                    inviteDialogOpen={inviteDialogOpen}
                    setInviteDialogOpen={setInviteDialogOpen}
                    projectId={project.id}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <MembersTable
          isOwner={isOwner}
          initialMembers={members}
          projectId={project.id}
          userId={userId}
          isActive={isActive}
        />

        {isOwner && isActive && <PendingInvitations projectId={project.id} />}
      </section>
    </div>
  );
}
