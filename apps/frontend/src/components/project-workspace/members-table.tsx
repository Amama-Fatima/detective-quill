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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import RemoveMemberDialog from "./remove-member-dialog";
import { Badge } from "../ui/badge";

//todo: fetch the members on server side from supabase, then for removal, make api call to backend

interface Member {
  id: string;
  name: string;
  role: "Author" | "Beta Reader";
  avatar?: string;
}

const initialMembers: Member[] = [
  { id: "1", name: "Elara Vance", role: "Author" },
  { id: "2", name: "Jaxson Reid", role: "Beta Reader" },
  { id: "3", name: "Lena Petrova", role: "Beta Reader" },
  { id: "4", name: "Marcus Thorne", role: "Beta Reader" },
];

const MembersTable = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

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
    <div className="">
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
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {`member${index + 1}@project.com`}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-secondary-foreground text-secondary text-[0.9rem] hover:bg-muted-foreground font-medium"
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

export default MembersTable;
