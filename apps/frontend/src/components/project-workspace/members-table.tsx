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
import { ProjectMember } from "@detective-quill/shared-types";
import { removeProjectMember } from "@/lib/backend-calls/members";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

const MembersTable = ({
  isOwner,
  initialMembers,
  projectId,
}: {
  isOwner: boolean;
  initialMembers: ProjectMember[] | [];
  projectId: string;
}) => {
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null
  );
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.access_token;

  const handleRemoveMember = (member: ProjectMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (memberToRemove) {
      try {
        setDeleting(true);
        await removeProjectMember(
          accessToken!,
          projectId,
          memberToRemove.user_id
        );
        setMembers(members.filter((m) => m.user_id !== memberToRemove.user_id));
        setRemoveDialogOpen(false);
        setMemberToRemove(null);
        toast.success("Member removed successfully");
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Failed to remove member. Please try again.");
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="">
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-4 mb-8">
          <h2 className="mystery-title font-bold text-2xl">Project Members</h2>
          <span className="noir-text text-[1rem] text-muted-foreground">
            {members.length} members
          </span>
        </div>
        <div className="w-[65%] mx-auto">
          <div className="noir-text bg-card-foreground/20 rounded-lg border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="font-semibold text-lg">
                    Member
                  </TableHead>
                  <TableHead className="font-semibold text-lg">Role</TableHead>
                  {isOwner && (
                    <TableHead className="text-right font-semibold text-lg">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => (
                  <TableRow
                    key={member.user_id}
                    className="hover:bg-card transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-100">
                          <AvatarImage
                            src={member.avatar_url ?? undefined}
                            alt={member.full_name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                            {member.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {member.full_name}
                          </span>
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
                        {!isOwner ? "Beta Reader" : "Author"}
                      </Badge>
                    </TableCell>
                    {isOwner && (
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
                    )}
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
        isLoading={deleting}
      />
    </div>
  );
};

export default MembersTable;
