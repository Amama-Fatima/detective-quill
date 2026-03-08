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
    <div className="mb-8 px-32 border-b border-border bg-muted/90 backdrop-blur-sm">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
              <History className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="mystery-title mb-2 text-4xl">Branch History</h1>
              <p className="noir-text text-muted-foreground">
                Commits for branch:
                <span className="text-background bg-foreground uppercase font-playfair-display text-lg ml-2 px-2 py-1 rounded">
                  {" "}
                  {branchName}
                </span>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <UpdateBranchForm
              projectId={projectId}
              branch={branch}
              onBranchUpdated={(updatedBranch) =>
                setBranchName(updatedBranch.name)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
