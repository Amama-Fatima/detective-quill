"use client";

import type { Branch } from "@detective-quill/shared-types";
import { useBranch } from "@/hooks/use-branch";
import BranchNode from "./branch-node";

interface BranchListProps {
  projectId: string;
  branches: Branch[];
}

export default function BranchList({ projectId, branches }: BranchListProps) {
  const { switchBranchMutation } = useBranch({ projectId });

  return (
    <div className="pt-8">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
          Branch Timeline
        </span>
        <div className="flex-1 border-t border-border/50" />
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
          {branches.length} {branches.length === 1 ? "branch" : "branches"} on record
        </span>
      </div>

      <div className="max-w-2xl">
        {branches.map((branch, index) => (
          <BranchNode
            key={branch.id}
            branch={branch}
            projectId={projectId}
            index={index}
            isLast={index === branches.length - 1}
            isSwitching={switchBranchMutation.isPending}
            onSwitch={(id) => switchBranchMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}