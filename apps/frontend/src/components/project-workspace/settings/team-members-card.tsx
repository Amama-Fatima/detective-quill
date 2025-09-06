"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { ProjectMember } from "@detective-quill/shared-types";
import { AddMemberDialog } from "./add-member-dialog";
import { MemberTableRow } from "./member-table-row";

interface TeamMembersCardProps {
  members: ProjectMember[];
  isOwner: boolean;
  projectAuthorId: string | null;
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  newMemberEmail: string;
  setNewMemberEmail: (email: string) => void;
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
  addingMember: boolean;
}

export function TeamMembersCard({
  members,
  isOwner,
  projectAuthorId,
  isAddMemberOpen,
  setIsAddMemberOpen,
  newMemberEmail,
  setNewMemberEmail,
  onAddMember,
  onRemoveMember,
  addingMember,
}: TeamMembersCardProps) {
  return (
    <Card className="shadow-lg border-accent/20">
      <CardHeader className="border-b border-accent/10 bg-gradient-to-r from-accent/5 to-transparent">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 mr-3 text-accent" />
            <div>
              <h3 className="text-xl font-serif">Investigation Team</h3>
              <p className="text-sm text-muted-foreground font-sans">
                Manage team members and their access levels
              </p>
            </div>
          </div>
          {isOwner && (
            <AddMemberDialog
              isOpen={isAddMemberOpen}
              setIsOpen={setIsAddMemberOpen}
              newMemberEmail={newMemberEmail}
              setNewMemberEmail={setNewMemberEmail}
              onAddMember={onAddMember}
              addingMember={addingMember}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Detective</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <MemberTableRow
                key={member.user_id}
                member={member}
                isOwner={isOwner}
                projectAuthorId={projectAuthorId}
                onRemoveMember={onRemoveMember}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
