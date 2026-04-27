"use client";

import React, { useState } from "react";
import { deleteInvitation } from "@/lib/backend-calls/invitations";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { Invitation } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { EnvelopeIcon } from "@/components/icons/envelope-icon";

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
        invitations.filter((inv) => inv.email !== invitation.email),
      );
      setNotAllowedEmails(
        notAllowedEmails.filter((e) => e !== invitation.email),
      );
      toast.success("Invitation revoked");
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast.error("Failed to revoke invitation. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="pt-8 space-y-4">
      <div className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
        <h4 className="font-playfair-display text-xl text-foreground">
          Pending Invitations
        </h4>
      </div>

      {invitations.length > 0 ? (
        <ul className="space-y-2">
          {invitations.map((invitation) => (
            <li
              key={invitation.invite_code}
              className="flex items-center justify-between gap-4 border border-border/50 bg-card px-4 py-3 hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <EnvelopeIcon />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground font-mono">
                    {invitation.email}
                  </p>
                  <p className="case-file text-xs text-muted-foreground mt-0.5">
                    Dispatch pending
                  </p>
                </div>
              </div>

              <button
                disabled={deleting}
                onClick={() => handleDeleteInvitation(invitation)}
                className="
                  shrink-0 case-file text-xs
                  border border-border/60 px-3 py-1
                  text-muted-foreground
                  hover:border-destructive hover:text-destructive
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center gap-3 border border-dashed border-border/50 min-h-24">
          <EnvelopeIcon faded />
          <span className="case-file text-xs text-muted-foreground">
            No dispatches outstanding
          </span>
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;
