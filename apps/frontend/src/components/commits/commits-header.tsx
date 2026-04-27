"use client";

import { useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { Branch } from "@detective-quill/shared-types";
import UpdateBranchForm from "@/components/branches/update-branch-form";

interface CommitsHeaderProps {
  projectId: string;
  branch: Branch;
}

export default function CommitsHeader({
  projectId,
  branch,
}: CommitsHeaderProps) {
  const [branchName, setBranchName] = useState(branch.name);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
      <div className="flex-1 min-w-0">

        {/* Branch name as the italic title, same scale as overview/blueprints */}
        <h1 className="font-playfair-display italic text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-3">
          {branchName}
        </h1>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2 my-6">
          {branch.is_default && (
            <span className="case-file text-[13px] tracking-[0.12em] uppercase px-2.5 py-1 border border-border/60 text-muted-foreground bg-muted/40">
              Default
            </span>
          )}
          {branch.is_active && (
            <span className="case-file text-[13px] tracking-[0.12em] uppercase px-2.5 py-1 bg-primary text-primary-foreground">
              Active
            </span>
          )}
        </div>

        <p className="noir-text text-[17px] leading-[1.8] text-foreground/85 max-w-xl mb-6">
          A complete record of all commits filed under this branch. Each entry
          represents a saved state of the manuscript.
        </p>

        <UpdateBranchForm
          projectId={projectId}
          branch={branch}
          onBranchUpdated={(updatedBranch) => setBranchName(updatedBranch.name)}
        />
      </div>

      <div className="shrink-0 flex flex-col items-center gap-4 self-center sm:self-end">
        <DotLottieReact
          src="/branches.lottie"
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
      </div>
    </div>
  );
}