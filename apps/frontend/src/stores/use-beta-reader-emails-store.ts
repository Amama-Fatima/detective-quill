import { create } from "zustand";
import { Invitation } from "@detective-quill/shared-types";

interface BetaReaderEmailsState {
  invitations: Invitation[];
  notAllowedEmails: string[];
  setInvitations: (invitations: Invitation[]) => void;
  setNotAllowedEmails: (emails: string[]) => void;
}

export const useBetaReaderEmailsStore = create<BetaReaderEmailsState>(
  (set, get) => ({
    invitations: [],
    notAllowedEmails: [],
    setInvitations: (invitations: Invitation[]) => set({ invitations }),
    setNotAllowedEmails: (emails: string[]) =>
      set({ notAllowedEmails: emails }),
  })
);
