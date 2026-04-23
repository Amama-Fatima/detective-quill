"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectMember } from "@detective-quill/shared-types";
import { Card, CardContent } from "@/components/ui/card";
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

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (members.length === 0) {
    return (
      <div>
        <SectionHeader title="Persons of Interest" count={0} />
        <div
          className="
            flex flex-col items-center justify-center gap-3
            border border-dashed border-border/60
            py-16 text-center
          "
        >
          {/* simple open-book SVG mark */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden
          >
            <rect
              x="1"
              y="6"
              width="15"
              height="24"
              rx="0"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/30"
            />
            <rect
              x="20"
              y="6"
              width="15"
              height="24"
              rx="0"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/30"
            />
            <line
              x1="18"
              y1="6"
              x2="18"
              y2="30"
              stroke="currentColor"
              strokeWidth="1"
              className="text-muted-foreground/30"
            />
          </svg>
          <p className="mystery-title text-lg text-foreground/60">
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

  // ── Dossier grid ─────────────────────────────────────────────────────────────
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
                border border-border/60 bg-card
                ${isAuthor ? "border-t-2 border-t-[#8B1A1A]" : ""}
              `}
            >
              {/* Paperclip mark */}
              <div
                aria-hidden
                className={`
                  absolute -top-[7px] right-5 w-3 h-5
                  border-2 rounded-t-full border-b-0
                  ${isAuthor ? "border-[#8B1A1A]" : "border-muted-foreground/40"}
                `}
              />

              {/* File number */}
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground/50">
                File #{String(index + 1).padStart(3, "0")}
              </span>

              {/* Avatar */}
              <Avatar
                className={`
                  h-12 w-12 rounded-none border
                  ${isAuthor ? "border-[#8B1A1A]/40" : "border-border/50"}
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
                        ? "bg-[#8B1A1A]/10 text-[#8B1A1A]"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {initials(member)}
                </AvatarFallback>
              </Avatar>

              {/* Name + email */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {member.full_name}
                </p>
                <p className="truncate font-mono text-[10px] text-muted-foreground mt-0.5">
                  {member.email}
                </p>
              </div>

              {/* Role badge */}
              <Badge variant={isAuthor ? "default" : "secondary"}>
                {isAuthor ? "Author" : "Beta Reader"}
              </Badge>

              {/* Divider + remove */}
              <div className="mt-auto border-t border-border/40 pt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground/40">
                  {isAuthor ? "Case Lead" : "Informant"}
                </span>
                {canRemove && (
                  <button
                    disabled={!isActive || deleting}
                    onClick={() => handleRemoveMember(member)}
                    aria-label={`Remove ${member.full_name}`}
                    className="
                      font-mono text-[9px] tracking-[0.14em] uppercase
                      text-muted-foreground/50 border border-border/40
                      px-1.5 py-0.5 rounded-none
                      hover:border-[#8B1A1A]/60 hover:text-[#8B1A1A]
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

// ── Shared section header ──────────────────────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
      <h4 className="mystery-title text-lg uppercase tracking-widest">
        {title}
      </h4>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">
        {count} on file
      </span>
    </div>
  );
}

export default MembersTable;
