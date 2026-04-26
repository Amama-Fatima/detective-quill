"use client";

import { useState } from "react";
import { BranchWithParent } from "@/lib/supabase-calls/branches";
import VersionControlHeader from "@/components/branches/version-control-header";
import VersionControlStatsBar from "@/components/branches/version-control-stats-bar";
import BranchList from "@/components/branches/branch-list";
import NoBranches from "@/components/branches/no-branches";
import CreateNewBranchForm from "@/components/branches/create-new-branch-form";

interface VersionControlClientProps {
  projectId: string;
  branches: BranchWithParent[];
  error?: string | null;
}

export default function VersionControlClient({
  projectId,
  branches,
  error,
}: VersionControlClientProps) {
  const [showNewBranchDialog, setShowNewBranchDialog] = useState(false);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        <VersionControlHeader
          projectId={projectId}
          branchCount={branches.length}
          onNewBranch={() => setShowNewBranchDialog(true)}
        />

        {!error && branches.length > 0 && (
          <VersionControlStatsBar branches={branches} />
        )}

        {!projectId ? (
          <p className="noir-text text-muted-foreground text-center py-16">
            Invalid project.
          </p>
        ) : error ? (
          <p className="noir-text text-muted-foreground text-center py-16">
            Error loading branches: {error}
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