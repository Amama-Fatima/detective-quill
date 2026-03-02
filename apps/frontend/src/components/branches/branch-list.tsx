"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Branch } from "@detective-quill/shared-types";
import { useBranch } from "@/hooks/use-branch";
import { CornerOrnamentIcon } from "../icons/corner-ornament-icon";

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
          className="relative max-w-xl rounded-lg border border-border bg-card p-4 transition-colors hover:bg-card/80"
        >
          <div className="pointer-events-none absolute left-0 top-1 text-border/70">
            <CornerOrnamentIcon className="h-11 w-11 translate-x-0.5 -translate-y-0.5" />
          </div>
          <div className="pointer-events-none absolute bottom-1 right-0 text-border/70">
            <CornerOrnamentIcon className="h-11 w-11 -translate-x-0.5 translate-y-0.5 rotate-180" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/workspace/${projectId}/version-control/${branch.id}`}
              className=" flex-1"
            >
              <p className="font-medium text-foreground truncate text-[22px]">
                {branch.name}
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
