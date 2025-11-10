"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { NAV_ITEMS } from "@/constants/project-constants";
import ChangeStateDropDown from "./change-state-dropdown";
import InviteMembersDialog from "./invite-memebers-dialog";
import { Project, ProjectMember } from "@detective-quill/shared-types";
import MembersTable from "./members-table";

interface WorkspaceMainBodyProps {
  project: Project;
  userId: string;
  members: ProjectMember[] | [];
}

const WorkspaceMainBody = ({
  project,
  userId,
  members,
}: WorkspaceMainBodyProps) => {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.replace("123", project.id),
  }));

  const isOwner = userId === project.author_id;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className="min-h-screen px-10 py-6">
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
      <MembersTable isOwner={isOwner} initialMembers={members} projectId={project.id} />
    </div>
  );
};

export default WorkspaceMainBody;
