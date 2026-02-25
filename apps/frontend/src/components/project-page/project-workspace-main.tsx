"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, GitBranch } from "lucide-react";
import { NAV_ITEMS } from "@/constants/project-constants";
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
import BranchesDropdown from "@/components/branches/branches-dropdown";

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
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.replace("123", project.id),
  }));

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

  return (
    <div className="min-h-[80vh] px-10 py-6">
      <div className="flex flex-col gap-6 mb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h4 className="font-bold text-xl mb-2">Description</h4>
          <p className="text-[1.05rem] w-full noir-text mb-2 leading-relaxed">
            {project.description ??
              "This section provides an overview and notes for the ongoing project. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </p>
          <p className="noir-text text-xs mt-1">
            <span className="flex items-center text-secondary-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span className="font-semibold mr-2">Last updated:</span>
              {project.updated_at ?? "N/A"}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          {isOwner && (
            <div className="flex items-center gap-3">
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

          <div className="flex flex-col items-end gap-2">
            <span className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
              Current branch
            </span>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow-sm">
                <GitBranch className="h-3.5 w-3.5" />
                <span className="truncate max-w-[14rem]">
                  {currentBranchLabel}
                </span>
              </div>
              <BranchesDropdown
                branches={branches}
                activeBranchId={activeBranch?.id ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-wrap gap-4 mb-8 justify-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={
                "flex noir-text items-center gap-3 px-6 py-2 rounded-md border transition-colors bg-card hover:bg-secondary-foreground hover:text-secondary"
              }
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <MembersTable
        isOwner={isOwner}
        initialMembers={members}
        projectId={project.id}
        userId={userId}
        isActive={isActive}
      />

      {isOwner && isActive && <PendingInvitations projectId={project.id} />}
    </div>
  );
}
