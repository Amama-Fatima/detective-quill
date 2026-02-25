"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Branch } from "@detective-quill/shared-types";
import { useBranch } from "@/hooks/use-branch";

interface VersionControlBranchListProps {
  projectId: string;
  branches: Branch[];
}

export default function BranchList({
  projectId,
  branches,
}: VersionControlBranchListProps) {
  const { switchBranchMutation } = useBranch({ projectId });

  return (
    <div className="space-y-3">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className="rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-card/80"
        >
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/workspace/${projectId}/version-control/${branch.id}`}
              className=" flex-1"
            >
              <p className="font-medium text-foreground truncate text-[22px]">
                {branch.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Branch ID: {branch.id}
              </p>
            </Link>

            <div className="flex items-center gap-2">
              {branch.is_default && (
                <span className="text-[12px] case-file px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  Default
                </span>
              )}
              {branch.is_active ? (
                <span className="text-[12px] case-file px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Active
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={switchBranchMutation.isPending}
                  onClick={() => switchBranchMutation.mutate(branch.id)}
                >
                  {switchBranchMutation.isPending ? "Switching..." : "Switch"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
