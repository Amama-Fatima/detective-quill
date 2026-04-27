"use client";

import { ProjectMember } from "@detective-quill/shared-types";
import { useMembersList } from "@/hooks/use-members-list";
import MemberCard from "./member-card";
import RemoveMemberDialog from "./remove-member-dialog";
import NoMembers from "./no-members";

interface ProjectMembersProps {
  isOwner: boolean;
  initialMembers: ProjectMember[] | [];
  projectId: string;
  userId: string;
  isActive: boolean;
}

export default function ProjectMembers({
  isOwner,
  initialMembers,
  projectId,
  userId,
  isActive,
}: ProjectMembersProps) {
  const {
    members,
    memberToRemove,
    removeDialogOpen,
    setRemoveDialogOpen,
    handleRemoveMember,
    confirmRemoveMember,
    deleting,
  } = useMembersList(initialMembers, projectId);

  if (members.length === 0) {
    return <NoMembers />;
  }

  return (
    <div className="pt-8 space-y-4">
      <div className="mb-5 flex items-baseline justify-between border-b border-border/60 pb-3">
        <h4 className="font-playfair-display text-xl text-foreground">
          Project Members
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {members.map((member, index) => (
          <MemberCard
            key={member.user_id}
            member={member}
            index={index}
            isOwner={isOwner}
            userId={userId}
            isActive={isActive}
            deleting={deleting}
            onRemove={handleRemoveMember}
          />
        ))}
      </div>

      <RemoveMemberDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        member={memberToRemove}
        onConfirm={confirmRemoveMember}
        isLoading={deleting}
      />
    </div>
  );
}