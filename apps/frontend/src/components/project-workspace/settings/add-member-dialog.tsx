"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Loader2 } from "lucide-react";

interface AddMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  onAddMember: () => void;
  addingMember: boolean;
}

export function AddMemberDialog({
  isOpen,
  setIsOpen,
  newMemberEmail,
  setNewMemberEmail,
  onAddMember,
  addingMember,
}: AddMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={addingMember}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Detective
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Add New Detective</DialogTitle>
          <DialogDescription>
            Invite a new team member to join your investigation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="detective@mystery.com"
              className="mt-1"
              disabled={addingMember}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={addingMember}
          >
            Cancel
          </Button>
          <Button onClick={onAddMember} disabled={addingMember}>
            {addingMember ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
