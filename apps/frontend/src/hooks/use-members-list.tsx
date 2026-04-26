import { useState } from "react";
import { ProjectMember } from "@detective-quill/shared-types";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";
import { useMembers } from "@/hooks/use-members";

export function useMembersList(
  initialMembers: ProjectMember[],
  projectId: string,
) {
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const { setNotAllowedEmails, notAllowedEmails } = useBetaReaderEmailsStore();
  const { removeMemberMutation } = useMembers(projectId);

  const handleRemoveMember = (member: ProjectMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    await removeMemberMutation.mutateAsync(memberToRemove.user_id);
    setMembers((prev) => prev.filter((m) => m.user_id !== memberToRemove.user_id));
    setNotAllowedEmails(notAllowedEmails.filter((e) => e !== memberToRemove.email));
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  return {
    members,
    memberToRemove,
    removeDialogOpen,
    setRemoveDialogOpen,
    handleRemoveMember,
    confirmRemoveMember,
    deleting: removeMemberMutation.isPending,
  };
}