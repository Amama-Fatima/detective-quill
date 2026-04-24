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
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const MembersTable = dynamic(() => import("./members/members-table"), {
  loading: () => (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 className="animate-spin h-5 w-5 text-primary" />
      <p className="noir-text text-primary text-sm">Loading members…</p>
    </div>
  ),
});

const PendingInvitations = dynamic(
  () => import("./invitations/pending-invitations"),
  {
    loading: () => (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className="animate-spin h-5 w-5 text-primary" />
        <p className="noir-text text-primary text-sm">Loading invitations…</p>
      </div>
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-primary", text: "text-primary-foreground" },
    completed: { bg: "bg-chart-4", text: "text-primary-foreground" },
    archived: { bg: "bg-muted-foreground/30", text: "text-muted-foreground" },
  };
  const s = map[status] ?? map.archived;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold ${s.bg} ${s.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
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
    if (prevInvKeys !== nextInvKeys) setInvitations(nextInvitations);
    const nextNotAllowed = [...invitedEmails, ...memberEmails];
    if (
      prevNotAllowed.slice().sort().join(",") !==
      nextNotAllowed.slice().sort().join(",")
    )
      setNotAllowedEmails(nextNotAllowed);
  }, [invitations, members, setInvitations, setNotAllowedEmails]);

  const formattedUpdatedAt = project.updated_at
    ? formatDate(new Date(project.updated_at), "MMM d, yyyy")
    : "N/A";
  const formattedCreatedAt = project.created_at
    ? formatDate(new Date(project.created_at), "MMM d, yyyy")
    : "N/A";

  const stats = [
    { label: "Members", value: String(members.length) },
    { label: "Branches", value: String(numBranches) },
    { label: "Active Branch", value: activeBranch?.name ?? "None" },
    { label: "Last Updated", value: formattedUpdatedAt },
    { label: "Opened", value: formattedCreatedAt },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground/50 mb-3">
              Case Workspace — Overview
            </p>
            <h1 className="font-playfair-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-4">
              {project.title}
            </h1>
            <p className="noir-text text-[15px] leading-[1.8] text-foreground/65 max-w-xl">
              {project.description ??
                "This section provides an overview and notes for the ongoing project."}
            </p>
          </div>

          {/* Right: Lottie illustration */}
          <div className="shrink-0 self-center sm:self-end">
            <DotLottieReact
              src="/notes.lottie"
              loop
              autoplay
              style={{ width: 140, height: 140 }}
            />
          </div>
        </div>
        <div className="border-b border-border">
          <div className="flex flex-wrap">
            <div className="flex flex-col gap-2 px-6 py-5 border-r border-border/60 min-w-32.5">
              <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/45">
                Status
              </span>
              <StatusChip status={project.status} />
            </div>

            {stats.map(({ label, value }, i) => (
              <div
                key={label}
                className={`flex flex-col gap-2 px-6 py-5 min-w-27.5 ${i < stats.length - 1 ? "border-r border-border/60" : ""}`}
              >
                <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/45">
                  {label}
                </span>
                <span className="font-playfair-display text-[15px] font-bold text-primary leading-none">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-3 py-5 border-b border-border/60">
            <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/40 mr-1">
              Actions
            </span>
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

        <div className="pt-8 space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
              Case Personnel
            </span>
            <div className="flex-1 border-t border-border/50" />
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
              {members.length} {members.length === 1 ? "member" : "members"} on
              file
            </span>
          </div>

          <MembersTable
            isOwner={isOwner}
            initialMembers={members}
            projectId={project.id}
            userId={userId}
            isActive={isActive}
          />
        </div>

        {isOwner && isActive && (
          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-border/50" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground/35 shrink-0">
                Pending Invitations
              </span>
              <div className="flex-1 border-t border-border/50" />
            </div>
            <PendingInvitations projectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
}
