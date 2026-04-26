import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicPendingInvitations = dynamic(
  () => import("./pending-invitations"),
  {
    loading: () => (
      <div className="flex items-center justify-center gap-2 py-8">
        <Loader2 className="animate-spin h-5 w-5 text-primary" />
        <p className="noir-text text-primary text-sm">Loading invitations…</p>
      </div>
    ),
  },
);

export default DynamicPendingInvitations;