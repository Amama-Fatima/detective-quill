"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { NAV_ITEMS } from "@/constants/project-constants";
import ChangeStateDropDown from "./change-state-dropdown";
import InviteMembersDialog from "./invite-memebers-dialog";
import {
  Project,
  ProjectMember,
  Invitation,
} from "@detective-quill/shared-types";
import MembersTable from "./members-table";
import PendingInvitations from "./pending-invitations";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";

interface WorkspaceMainBodyProps {
  project: Project;
  userId: string;
  members: ProjectMember[] | [];
  invitations: Invitation[] | [];
}

const WorkspaceMainBody = ({
  project,
  userId,
  members,
  invitations,
}: WorkspaceMainBodyProps) => {
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

  return (
    <div className="min-h-[80vh] px-10 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h4 className="font-bold text-xl">Description</h4>
          <p className="text-[1.1rem] w-[70%] noir-text mb-2">
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

        {/* Action Buttons */}
        {isOwner && (
          <div className="flex items-center gap-4">
            <ChangeStateDropDown />
            <InviteMembersDialog
              inviteDialogOpen={inviteDialogOpen}
              setInviteDialogOpen={setInviteDialogOpen}
              projectId={project.id}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
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
              <div className="flex flex-col">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs">{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Members Table */}
      <MembersTable
        isOwner={isOwner}
        initialMembers={members}
        projectId={project.id}
        userId={userId}
      />

      {isOwner && <PendingInvitations projectId={project.id} />}
    </div>
  );
};

export default WorkspaceMainBody;
