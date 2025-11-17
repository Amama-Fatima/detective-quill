"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { inviteProjectMembers } from "@/lib/backend-calls/members";
import { EmailSendingApiRequestDto } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { validateEmails } from "@/lib/utils/invitation-utils";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";

interface InviteMembersDialogProps {
  inviteDialogOpen: boolean;
  setInviteDialogOpen: (open: boolean) => void;
  projectId: string;
}

const InviteMembersDialog = ({
  inviteDialogOpen,
  setInviteDialogOpen,
  projectId,
}: InviteMembersDialogProps) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  const { user, session } = useAuth();
  const username = user?.user_metadata.full_name || "Someone";
  const accessToken = session?.access_token || "";

  const handleAddEmailField = () => setEmails([...emails, ""]);

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };
  const { setNotAllowedEmails, notAllowedEmails } = useBetaReaderEmailsStore();

  const handleSendInvitations = async () => {
    try {
      setLoading(true);
      const { validEmails, invalidEmails } = validateEmails(
        emails,
        notAllowedEmails
      );
      if (invalidEmails.length > 0) {
        toast.error(
          `Emails already invited: ${invalidEmails.join(
            ", "
          )}. Enter valid emails and try again.`
        );
        return;
      }
      const requestData: EmailSendingApiRequestDto = {
        projectId,
        emails: validEmails,
        inviterName: username,
      };
      await inviteProjectMembers(requestData, accessToken);
      const updatedNotAllowedEmails = [...notAllowedEmails, ...validEmails];
      setNotAllowedEmails(updatedNotAllowedEmails);
      setInviteDialogOpen(false);
      setEmails([""]);
      toast.success("Invitation emails sent successfully");
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Failed to send invitation emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary shadow-lg mt-6 cursor-pointer hover:bg-primary/90">
          Invite Beta Readers
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mystery-title text-xl">
            Invite Beta Readers
          </DialogTitle>
          <DialogDescription className="noir-text text-[1rem]">
            Enter the email addresses of the readers you’d like to invite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {emails.map((email, index) => (
            <Input
              key={index}
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className="border-border"
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEmailField}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSendInvitations}
            className="bg-primary cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Invitations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersDialog;
