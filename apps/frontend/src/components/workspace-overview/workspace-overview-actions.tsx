// components/workspace/workspace-actions.tsx
import { useState } from "react";
import ChangeStateDropDown from "./change-state-dropdown";
import InviteMembersDialog from "./members/invite-memebers-dialog";

interface WorkspaceActionsProps {
  projectId: string;
  status: "active" | "completed" | "archived";
  isActive: boolean;
}

export default function WorkspaceActions({
  projectId,
  status,
  isActive,
}: WorkspaceActionsProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 py-5 border-b border-border/60">
      <ChangeStateDropDown projectId={projectId} status={status} />
      {isActive && (
        <InviteMembersDialog
          inviteDialogOpen={inviteDialogOpen}
          setInviteDialogOpen={setInviteDialogOpen}
          projectId={projectId}
        />
      )}
    </div>
  );
}