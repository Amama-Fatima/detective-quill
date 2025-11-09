"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Trash2, Plus } from "lucide-react";
import { NAV_ITEMS } from "@/constants/project-constants";
import { cn } from "@/lib/utils/utils";
import RemoveMemberDialog from "./remove-member-dialog";

interface Project {
  id: string;
  title: string;
  description: string | null;
  author_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

interface Member {
  id: string;
  name: string;
  role: "Author" | "Beta Reader";
  avatar?: string;
}

interface WorkspaceMainBodyProps {
  project: Project;
}

const initialMembers: Member[] = [
  { id: "1", name: "Elara Vance", role: "Author" },
  { id: "2", name: "Jaxson Reid", role: "Beta Reader" },
  { id: "3", name: "Lena Petrova", role: "Beta Reader" },
  { id: "4", name: "Marcus Thorne", role: "Beta Reader" },
];

const WorkspaceMainBody = ({ project }: WorkspaceMainBodyProps) => {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.href.replace("123", project.id),
  }));

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

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

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      setMembers(members.filter((m) => m.id !== memberToRemove.id));
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

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
          <p className="text-xs mt-1">
            <span className="flex items-center text-secondary-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span className="font-semibold mr-2">Last updated:</span>
              {project.updated_at ?? "N/A"}
            </span>
          </p>
        </div>

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
                "flex items-center gap-3 px-6 py-2 rounded-md border transition-colors bg-card hover:bg-secondary-foreground hover:text-secondary"
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

      <div className="space-y-4">
        <div className="flex items-center justify-start gap-4 mb-8">
          <h2 className="font-bold text-2xl">Project Members</h2>
          <span className="text-[1rem] text-muted-foreground">
            {members.length} members
          </span>
        </div>

        <div className="w-[85%] mx-auto">
          <div className="rounded-lg border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="font-semibold text-lg">
                    Member
                  </TableHead>
                  <TableHead className="font-semibold text-lg">Role</TableHead>
                  <TableHead className="text-right font-semibold text-lg">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-card transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-100">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {member.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            { `member${index + 1}@project.com`}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-secondary-foreground text-secondary text-[0.9rem] hover:bg-blue-100 font-medium"
                      >
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member)}
                        className="hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No members yet. Add someone to get started!</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={(v) => setRemoveDialogOpen(v)}
        member={memberToRemove}
        onConfirm={confirmRemoveMember}
      />
    </div>
  );
};

export default WorkspaceMainBody;
