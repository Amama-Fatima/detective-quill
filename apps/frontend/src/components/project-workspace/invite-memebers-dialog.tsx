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

interface InviteMembersDialogProps {
  inviteDialogOpen: boolean;
  setInviteDialogOpen: (open: boolean) => void;
}

const InviteMembersDialog = ({
  inviteDialogOpen,
  setInviteDialogOpen,
}: InviteMembersDialogProps) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const handleAddEmailField = () => setEmails([...emails, ""]);

  const handleEmailChange = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleSendInvitations = () => {
    console.log("Inviting:", emails);
    setInviteDialogOpen(false);
    setEmails([""]);
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
          <DialogTitle>Invite Beta Readers</DialogTitle>
          <DialogDescription>
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
            className="bg-primary cursor-pointer hover:bg-primary/90"
          >
            Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersDialog;
