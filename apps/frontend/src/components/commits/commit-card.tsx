"use client";

import { Commit } from "@detective-quill/shared-types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GitCommit, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "date-fns";
import Link from "next/link";
import { CalendarIcon } from "../icons/calendar-icon";

interface CommitCardProps {
  commit: Commit;
  projectId: string;
  branchId?: string;
}

export default function CommitCard({
  commit,
  projectId,
  branchId,
}: CommitCardProps) {
  const date = commit.created_at ? new Date(commit.created_at) : null;
  const timeAgo = date ? formatDistanceToNow(date, { addSuffix: true }) : null;
  const formattedDate = date ? formatDate(date, "PPPpp") : "Unknown date";
  const commitBranchId = branchId ?? commit.branch_id;
  const commitHref = `/workspace/${projectId}/version-control/${commitBranchId}/${commit.id}`;

  const isInheritedFromParentBranch =
    !!branchId && !!commit.branch_id && commit.branch_id !== branchId;

  const cardContent = (
    <Card
      className={`relative group overflow-hidden border bg-card transition-all duration-200 max-w-2xl mx-auto ${
        isInheritedFromParentBranch
          ? "cursor-not-allowed opacity-85"
          : "cursor-pointer shadow-sm hover:shadow-md hover:border-primary/50"
      }`}
      aria-disabled={isInheritedFromParentBranch}
    >
      <CardHeader className="">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full border border-primary/20 bg-primary/10 p-2.5">
            <GitCommit className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium leading-snug text-foreground">
              {commit.message || "No message"}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-5 w-5" />
              <span title={formattedDate}>{timeAgo ?? formattedDate}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-11">
        <p className="text-md text-muted-foreground">{formattedDate}</p>
        {isInheritedFromParentBranch && (
          <div className="relative mt-3 rounded-xl border border-dashed border-primary/40 bg-muted/70 p-4 shadow-inner">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Note
            </p>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              This commit was made in the parent branch.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              To view this commit snapshot, open the parent branch history.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isInheritedFromParentBranch) {
    return cardContent;
  }

  return <Link href={commitHref}>{cardContent}</Link>;
}
