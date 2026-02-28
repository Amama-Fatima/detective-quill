"use client";

import { useState, useEffect } from "react";
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
import { ClockIcon } from "../icons/clock-icon";
import { MailIcon } from "../icons/mail-icon";
import { UsersIcon } from "../icons/users-icon";
import { GitBranchIcon } from "../icons/git-branch-icon";

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 mx-auto min-h-[80vh] w-full max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-8 rounded-lg border border-border/70 bg-gradient-to-br from-card via-card/90 to-background p-6 shadow-sm md:p-8">
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

              <h4 className="mystery-title text-2xl md:text-3xl">
                Case Summary
              </h4>
              <p className="noir-text text-[1.05rem] leading-relaxed text-foreground/90">
                {project.description ??
                  "This section provides an overview and notes for the ongoing project. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-primary">
                <span className="inline-flex items-center gap-1.5 rounded-full border  bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                  <ClockIcon />
                  Updated: {project.updated_at ?? "N/A"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border  bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                  <UsersIcon />
                  {members.length} Members
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border  bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform ">
                  <MailIcon />
                  {invitations.length} Pending Invites
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border  bg-background/60 px-3 py-1.5 hover:-translate-y-0.5 transition-transform">
                  <GitBranchIcon />
                  {numBranches} Branches
                </span>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm lg:w-auto lg:min-w-[20rem]">
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <GitBranchIcon />
                </div>
                <div className="flex-1">
                  <div className="text-md text-muted-foreground">
                    Current Branch
                  </div>
                  <div className="font-mono text-sm font-medium truncate max-w-[14rem]">
                    {currentBranchLabel}
                  </div>
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
    </div>
  );
}
