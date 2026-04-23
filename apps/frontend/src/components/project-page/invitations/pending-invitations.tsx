"use client";

import React, { useState } from "react";
import { Button } from "../../ui/button";
import { deleteInvitation } from "@/lib/backend-calls/invitations";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { Invitation } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { MailIcon } from "@/components/icons/mail-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { DeleteIcon } from "@/components/icons/delete-icon";
import { NoMailIcon } from "@/components/icons/no-mail-icon";

const PendingInvitations = ({ projectId }: { projectId: string }) => {
  const [deleting, setDeleting] = useState(false);
  const { invitations, setInvitations, notAllowedEmails, setNotAllowedEmails } =
    useBetaReaderEmailsStore();
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const handleDeleteInvitation = async (invitation: Invitation) => {
    try {
      setDeleting(true);
      await deleteInvitation(invitation.invite_code, projectId, accessToken!);

      setInvitations(
        invitations.filter((inv) => inv.email != invitation.email),
      );

      const updatedNotAllowedEmails = notAllowedEmails.filter(
        (email) => email !== invitation.email,
      );
      setNotAllowedEmails(updatedNotAllowedEmails);
      toast.success("Invitation deleted successfully");
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      toast.error("Failed to delete invitation. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-4">
        <h4 className="mystery-title text-xl font-bold">Pending Invitations</h4>
        <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-sm text-muted-foreground">
          {invitations.length}
        </span>
      </div>

      {invitations.length > 0 ? (
        <ul className="space-y-3">
          {invitations.map((invitation) => (
            <li
              key={invitation.invite_code}
              className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/70 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <MailIcon />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {invitation.email}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ClockIcon size={16} />
                    Awaiting response
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                className="cursor-pointer rounded-md transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed"
                disabled={deleting}
                onClick={() => handleDeleteInvitation(invitation)}
              >
                <DeleteIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-28 items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-background/60 text-muted-foreground">
          <NoMailIcon />
          <span className="noir-text">No pending invitations.</span>
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;
