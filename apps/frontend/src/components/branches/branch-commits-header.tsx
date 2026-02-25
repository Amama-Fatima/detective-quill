"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type { Branch } from "@detective-quill/shared-types";
import UpdateBranchForm from "@/components/branches/update-branch-form";

interface BranchCommitsHeaderProps {
  projectId: string;
  branch: Branch;
}

export default function BranchCommitsHeader({
  projectId,
  branch,
}: BranchCommitsHeaderProps) {
  const [branchName, setBranchName] = useState(branch.name);

  return (
    <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <History className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Case History
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Commits for branch: {branchName}
          </p>
        </div>
      </div>
      <UpdateBranchForm
        projectId={projectId}
        branch={branch}
        onBranchUpdated={(updatedBranch) => setBranchName(updatedBranch.name)}
      />
    </div>
  );
}
