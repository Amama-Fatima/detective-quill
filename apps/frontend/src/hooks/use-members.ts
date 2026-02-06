import {
  inviteProjectMembers,
  removeProjectMember,
} from "@/lib/backend-calls/members";
import { EmailSendingApiRequestDto } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export const useMembers = (projectId: string) => {
  const { user, session } = useAuth();
  const accessToken = session?.access_token || "";
  const username = user?.user_metadata.full_name || "Someone";

  const sendInvitationsMutation = useMutation({
    mutationFn: async (validEmails: string[]) => {
      const requestData: EmailSendingApiRequestDto = {
        projectId,
        emails: validEmails,
        inviterName: username,
      };
      await inviteProjectMembers(requestData, accessToken);
    },

    onSuccess: () => {
      toast.success("Invitations sent successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to send invitations: ${error.message}`);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await removeProjectMember(accessToken, projectId, userId);
    },

    onSuccess: () => {
      toast.success("Member removed successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to remove member: ${error.message}`);
    },
  });

  return {
    sendInvitationsMutation,
    removeMemberMutation,
  };
};
