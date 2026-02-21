"use client";

import { Commit } from "@detective-quill/shared-types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GitCommit, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "date-fns";
import Link from "next/link";

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

  const commitHref = commitBranchId
    ? `/workspace/${projectId}/version-control/${commitBranchId}/${commit.id}`
    : `/workspace/${projectId}/commits/${commit.id}`;

  return (
    <Link href={commitHref}>
      <Card className="overflow-hidden border-border/80 bg-card/50 hover:bg-card/80 transition-all shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <GitCommit className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground leading-snug line-clamp-2">
                {commit.message || "No message"}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4 shrink-0" />
                <span title={formattedDate}>{timeAgo ?? formattedDate}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4 pl-11">
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
