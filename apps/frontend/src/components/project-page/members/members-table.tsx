"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import RemoveMemberDialog from "./remove-member-dialog";
import { Badge } from "@/components/ui/badge";
import { ProjectMember } from "@detective-quill/shared-types";
import { Card, CardContent } from "@/components/ui/card";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { useMembers } from "@/hooks/use-members";
import Image from "next/image";

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

      const updatedNotAllowedEmails = notAllowedEmails.filter(
        (email) => email !== memberToRemove.email,
      );
      setNotAllowedEmails(updatedNotAllowedEmails);
    }
  };

  if (members.length === 0) {
    return (
      /*
        ── book.svg ────────────────────────────────────────────────────────────
        Shown prominently in the empty state instead of the generic UserPlus
        icon. A closed red book fits perfectly — no beta readers yet means the
        book is still unread.
      */
      <Card className="rounded-md border border-border/70 bg-linear-to-br from-card to-background py-16 text-center shadow-sm">
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative rounded-full border border-border/60 bg-primary/10 p-8 text-center">
              <Image
                src="/book.svg"
                alt="No beta readers yet"
                width={48}
                height={48}
                className="opacity-80"
              />
            </div>
            <div className="space-y-2">
              <h3 className="mystery-title text-2xl">No Beta Readers Added</h3>
              <p className="text-muted-foreground noir-text max-w-md">
                Your project currently has no beta readers. Invite members to
                collaborate and provide feedback on your writing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/*
        ── crime-scene.svg ───────────────────────────────────────────────────
        Ghosted into the top-right of the Members section header. Gives the
        table a sense of "evidence being catalogued" — fits the case-file
        aesthetic without being distracting.
      */}
      <div className="relative mb-5">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 hidden sm:block"
          style={{ width: 56, height: 56, opacity: 0.12 }}
        >
          <Image
            src="/crime-scene.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/70">
          <h4 className="mystery-title text-2xl font-bold">Members</h4>
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            {members.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border/70 bg-background/70">
        {members.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="p-2">
                <TableRow className="bg-muted/40">
                  <TableHead className="text-base font-semibold">
                    Members
                  </TableHead>
                  <TableHead className="text-base font-semibold">
                    Role
                  </TableHead>
                  {isOwner && (
                    <TableHead className="text-right text-base font-semibold">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member.user_id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/70">
                          <AvatarImage
                            src={member.avatar_url?.trim() || undefined}
                            alt={member.full_name}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-3 text-white font-medium">
                            {(
                              member.full_name ??
                              member.username ??
                              member.email
                            )
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {member.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`border border-border ${!member.is_author && "bg-secondary/90 text-secondary-foreground"} text-[0.8rem] font-medium case-file ${member.is_author && "bg-foreground text-background"}`}
                      >
                        {!member.is_author ? "Beta Reader" : "Author"}
                      </Badge>
                    </TableCell>
                    {isOwner && member.user_id !== userId && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!isActive || deleting}
                          onClick={() => handleRemoveMember(member)}
                          className="cursor-pointer rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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

export default MembersTable;
