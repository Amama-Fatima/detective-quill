"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMember } from "@detective-quill/shared-types";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { useMembers } from "@/hooks/use-members";
import RemoveMemberDialog from "./remove-member-dialog";

const MembersTable = ({
  isOwner,
  initialMembers,
  projectId,
  userId,
  isActive,
}: {
  isOwner: boolean;
  initialMembers: ProjectMember[] | [];
  projectId: string;
  userId: string;
  isActive: boolean;
}) => {
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null,
  );
  const { setNotAllowedEmails, notAllowedEmails } = useBetaReaderEmailsStore();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const { removeMemberMutation } = useMembers(projectId);
  const deleting = removeMemberMutation.isPending;

  const handleRemoveMember = (member: ProjectMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToRemove) {
      await removeMemberMutation.mutateAsync(memberToRemove.user_id);
      setMembers(members.filter((m) => m.user_id !== memberToRemove.user_id));
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      setNotAllowedEmails(
        notAllowedEmails.filter((e) => e !== memberToRemove.email),
      );
    }
  };

  const initials = (member: ProjectMember) =>
    (member.full_name ?? member.username ?? member.email)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // ── Empty state ────────────────────────────────────────────────────────────
  if (members.length === 0) {
    return (
      <div>
        <SectionHeader title="Persons of Interest" count={0} />
        <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border/60 py-16 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden
          >
            <rect
              x="1"
              y="7"
              width="17"
              height="26"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-muted-foreground/30"
            />
            <rect
              x="22"
              y="7"
              width="17"
              height="26"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-muted-foreground/30"
            />
            <line
              x1="20"
              y1="7"
              x2="20"
              y2="33"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-muted-foreground/30"
            />
          </svg>
          <p className="mystery-title text-xl text-muted-foreground">
            No persons on file
          </p>
          <p className="noir-text text-sm text-muted-foreground max-w-xs">
            No beta readers have been added yet. Invite collaborators to open
            their dossiers.
          </p>
        </div>
      </div>
    );
  }

  // ── Dossier grid ──────────────────────────────────────────────────────────
  return (
    <div>
      <SectionHeader title="Persons of Interest" count={members.length} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {members.map((member, index) => {
          const isAuthor = member.is_author;
          const canRemove = isOwner && member.user_id !== userId && !isAuthor;

          return (
            <div
              key={member.user_id}
              className={`
                relative flex flex-col gap-3 p-4
                border bg-card
                ${
                  isAuthor
                    ? "border-t-2 border-t-primary border-x-border border-b-border"
                    : "border-border"
                }
                hover:bg-accent/20 transition-colors
              `}
            >
              {/* Paperclip mark */}
              <div
                aria-hidden
                className={`
                  absolute -top-[7px] right-5 w-3 h-5
                  border-2 rounded-t-full border-b-0
                  ${isAuthor ? "border-primary" : "border-muted-foreground/35"}
                `}
              />

              {/* File number */}
              <span className="case-file text-xs text-muted-foreground">
                File #{String(index + 1).padStart(3, "0")}
              </span>

              {/* Avatar */}
              <Avatar
                className={`
                  h-12 w-12 rounded-none border
                  ${isAuthor ? "border-primary/50" : "border-border/60"}
                `}
              >
                <AvatarImage
                  src={member.avatar_url?.trim() || undefined}
                  alt={member.full_name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="object-cover"
                />
                <AvatarFallback
                  className={`
                    rounded-none font-mono text-sm font-bold
                    ${
                      isAuthor
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {initials(member)}
                </AvatarFallback>
              </Avatar>

              {/* Name + email */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-foreground font-sans">
                  {member.full_name}
                </p>
                <p className="truncate case-file text-xs text-muted-foreground mt-0.5 normal-case tracking-normal">
                  {member.email}
                </p>
              </div>

              {/* Role badge */}
              <Badge variant={isAuthor ? "default" : "secondary"}>
                {isAuthor ? "Author" : "Beta Reader"}
              </Badge>

              {/* Footer: role label + remove */}
              <div className="mt-auto border-t border-border/40 pt-2 flex items-center justify-between">
                <span className="case-file text-xs text-muted-foreground/60">
                  {isAuthor ? "Case Lead" : "Informant"}
                </span>
                {canRemove && (
                  <button
                    disabled={!isActive || deleting}
                    onClick={() => handleRemoveMember(member)}
                    aria-label={`Remove ${member.full_name}`}
                    className="
                      case-file text-xs
                      text-muted-foreground border border-border/50
                      px-2 py-0.5
                      hover:border-destructive hover:text-destructive
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors
                    "
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={(v) => setRemoveDialogOpen(v)}
        member={memberToRemove}
        onConfirm={confirmRemoveMember}
        isLoading={deleting}
      />
    </div>
  );
};

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
      <h4 className="mystery-title text-xl text-foreground">{title}</h4>
      <span className="case-file text-xs text-muted-foreground">
        {count} on file
      </span>
    </div>
  );
}

export default MembersTable;
