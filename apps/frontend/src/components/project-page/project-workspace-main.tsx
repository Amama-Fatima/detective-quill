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
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { formatDate } from "date-fns";
import CaseStamp from "./case-stamp";

const MembersTable = dynamic(() => import("./members/members-table"), {
  loading: () => (
    <>
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
        <p className="noir-text text-primary text-[14px]">Loading...</p>
      </div>
    </>
  ),
});

const PendingInvitations = dynamic(
  () => import("./invitations/pending-invitations"),
  {
    loading: () => (
      <>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />
          <p className="noir-text text-primary text-[14px]">Loading...</p>
        </div>
      </>
    ),
  },
);

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 mx-auto min-h-[80vh] w-full max-w-7xl px-4 py-6 md:px-6">
        {/* ── Summary card ─────────────────────────────────────────────────── */}
        <section className="relative mb-8 overflow-hidden rounded-lg border border-border/70 bg-gradient-to-br from-card via-card/90 to-background p-4 shadow-sm sm:p-6 md:p-8">
          {/*
            Two-column layout on sm+:
              left  — workspace label, title, description, action buttons
              right — CaseStamp (replaces the old stat badges + branch panel)
          */}
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            {/* ── Left: title + description + actions ─────────────────────── */}
            <div className="flex flex-1 flex-col gap-4 min-w-0">
              <span className="w-fit rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground case-file">
                Case Workspace
              </span>

              <h4 className="mystery-title text-xl sm:text-2xl md:text-3xl">
                Case Summary
              </h4>

              <p className="noir-text text-sm leading-relaxed text-foreground/90 sm:text-base md:text-[1.05rem]">
                {project.description ??
                  "This section provides an overview and notes for the ongoing project."}
              </p>

              {/* Action buttons — only for owner */}
              {isOwner && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
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

            {/* ── Right: stamp ─────────────────────────────────────────────── */}
            {/*
              On mobile the stamp sits below the text and is centred.
              On sm+ it floats to the right, slightly rotated, like it was
              physically slapped onto the case file.
            */}
            <div className="flex justify-center sm:justify-end sm:pt-2">
              <CaseStamp
                project={project}
                members={members}
                invitations={invitations}
                numBranches={numBranches}
                activeBranch={activeBranch}
              />
            </div>
          </div>
        </section>

        {/* ── Members / invitations card ────────────────────────────────────── */}
        <section className="space-y-8 rounded-lg border border-border/70 bg-card/85 p-5 shadow-sm md:p-6">
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
