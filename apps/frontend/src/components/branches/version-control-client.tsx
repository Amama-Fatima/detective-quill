"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { BranchWithParent } from "@/lib/supabase-calls/branches";
import VersionControlHeader from "@/components/branches/version-control-header";
import VersionControlStatsBar from "@/components/branches/version-control-stats-bar";
import BranchList from "@/components/branches/branch-list";
import NoBranches from "@/components/branches/no-branches";
import CreateNewBranchForm from "@/components/branches/create-new-branch-form";
import { getBranchesByProject } from "@/lib/backend-calls/branches";

interface VersionControlClientProps {
  projectId: string;
  initialBranches: BranchWithParent[];
}

export default function VersionControlClient({
  projectId,
  initialBranches,
}: VersionControlClientProps) {
  const [showNewBranchDialog, setShowNewBranchDialog] = useState(false);
  const { session } = useAuth();
  const accessToken = session?.access_token ?? "";

  const { data, error } = useQuery({
    queryKey: ["branches", projectId],
    queryFn: () => getBranchesByProject(projectId, accessToken),
    initialData: initialBranches, 
    enabled: !!accessToken,
  });

  const branches: BranchWithParent[] = Array.isArray(data) ? data : initialBranches;
  const errorMessage = error ? (error as Error).message : null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />
      <div className="pointer-events-none absolute top-[35%] -right-7.5 w-25 h-25 rounded-full bg-secondary-foreground opacity-25 z-1" />
      <div className="pointer-events-none absolute bottom-[20%] -left-5 w-32.5 h-32.5 rounded-full bg-secondary-foreground opacity-20 z-1" />
      <div className="pointer-events-none absolute -bottom-7.5 right-[25%] w-22.5 h-22.5 rounded-full bg-secondary-foreground opacity-25 z-1" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        <VersionControlHeader
          projectId={projectId}
          branchCount={branches.length}
          onNewBranch={() => setShowNewBranchDialog(true)}
        />

        {!errorMessage && branches.length > 0 && (
          <VersionControlStatsBar branches={branches} />
        )}

        {!projectId ? (
          <p className="noir-text text-muted-foreground text-center py-16">
            Invalid project.
          </p>
        ) : errorMessage ? (
          <p className="noir-text text-muted-foreground text-center py-16">
            Error loading branches: {errorMessage}
          </p>
        ) : branches.length === 0 ? (
          <NoBranches />
        ) : (
          <BranchList projectId={projectId} branches={branches} />
        )}
      </div>

      <CreateNewBranchForm
        open={showNewBranchDialog}
        onOpenChange={setShowNewBranchDialog}
        projectId={projectId}
        branches={branches}
      />
    </div>
  );
}