"use client";

import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Trash, MailX } from "lucide-react";
import { deleteInvitation } from "@/lib/backend-calls/invitations";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { Invitation } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

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
      {invitations.length > 0 ? (
        <div className="mt-6 w-[60%] mx-auto">
          <h4 className="font-bold text-lg mb-4">Pending Invitations</h4>
          <ul className="list-disc list-inside">
            {invitations.map((invitation, index) => (
              <div key={index} className="flex items-center gap-4 mt-3">
                <li className="noir-text text-primary">{invitation.email}</li>
                <Button
                  className="hover:bg-accent/90 cursor-pointer disabled:cursor-not-allowed"
                  disabled={deleting}
                  onClick={() => handleDeleteInvitation(invitation)}
                >
                  <Trash />
                </Button>
              </div>
            ))}
          </ul>
        </div>
      ) : (
        <div className="w-[65%] mx-auto mt-10">
          <h4 className="font-bold text-lg mb-4">Pending Invitations</h4>
          <div className=" flex text-center items-center justify-center gap-2">
            <MailX />
            <span className="noir-text">No pending invitations.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;
