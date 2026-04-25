import { useEffect } from "react";
import { Invitation, ProjectMember } from "@detective-quill/shared-types";
import { useBetaReaderEmailsStore } from "@/stores/use-beta-reader-emails-store";

export function useWorkspaceSync(
  invitations: Invitation[],
  members: ProjectMember[],
) {
  const { setInvitations, setNotAllowedEmails } = useBetaReaderEmailsStore();

  useEffect(() => {
    const storeState = useBetaReaderEmailsStore.getState();
    const prevInvitations = storeState.invitations || [];
    const prevNotAllowed = storeState.notAllowedEmails || [];

    const nextInvitations = invitations || [];
    const prevInvKeys = prevInvitations
      .map((p) => p.invite_code ?? p.email)
      .sort()
      .join(",");
    const nextInvKeys = nextInvitations
      .map((p) => p.invite_code ?? p.email)
      .sort()
      .join(",");

    if (prevInvKeys !== nextInvKeys) setInvitations(nextInvitations);

    const invitedEmails = invitations.map((inv) => inv.email);
    const memberEmails = members.map((m) => m.email);
    const nextNotAllowed = [...invitedEmails, ...memberEmails];

    if (
      prevNotAllowed.slice().sort().join(",") !==
      nextNotAllowed.slice().sort().join(",")
    ) {
      setNotAllowedEmails(nextNotAllowed);
    }
  }, [invitations, members, setInvitations, setNotAllowedEmails]);
}