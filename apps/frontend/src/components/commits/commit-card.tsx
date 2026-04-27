"use client";

import { Commit } from "@detective-quill/shared-types";
import { formatDistanceToNow, formatDate } from "date-fns";
import Link from "next/link";
import { GitCommit, ArrowRight, GitBranch } from "lucide-react";
import { CornerOrnamentIcon } from "../icons/corner-ornament-icon";
import { ClockIcon } from "../icons/clock-icon";

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
  const formattedDate = date ? formatDate(date, "MMM d, yyyy") : "Unknown date";
  const formattedTime = date ? formatDate(date, "HH:mm") : null;
  const commitBranchId = branchId ?? commit.branch_id;
  const commitHref = `/workspace/${projectId}/version-control/${commitBranchId}/${commit.id}`;

  const shortId = commit.id?.slice(0, 7).toUpperCase() ?? "UNKNOWN";

  const isInherited =
    !!branchId && !!commit.branch_id && commit.branch_id !== branchId;

  const inner = (
    <div
      className={`
        relative border bg-card overflow-hidden
        transition-all duration-200  hover:border-primary/60 hover:bg-accent/60
        ${
          isInherited
            ? "border-border/40 opacity-60 cursor-not-allowed"
            : "border-border cursor-pointer group"
        }
      `}
      aria-disabled={isInherited}
    >
      <div className="pointer-events-none absolute left-0 top-1 text-border/40">
        <CornerOrnamentIcon className="h-8 w-8 translate-x-0.5 -translate-y-0.5" />
      </div>
      <div className="pointer-events-none absolute bottom-1 right-0 text-border/40">
        <CornerOrnamentIcon className="h-8 w-8 -translate-x-0.5 translate-y-0.5 rotate-180" />
      </div>

      <div className="flex items-center justify-between px-5 py-2 border-b border-border/50 bg-muted">
        <div className="flex items-center gap-2">
          <GitCommit className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="font-mono text-[12px] tracking-[0.14em] text-foreground uppercase">
            {shortId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon />
          {formattedTime && (
            <span className="font-mono text-[12px] tracking-widest text-foreground uppercase hidden sm:block">
              {formattedTime}
            </span>
          )}
          <span className="case-file text-[12px] tracking-widest text-foreground">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        {isInherited ? (
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <GitBranch className="h-4 w-4 text-muted-foreground/40" />
            </div>
            <div className="min-w-0">
              <p className="font-playfair-display italic text-[15px] text-foreground/50 line-clamp-2 mb-2">
                {commit.message || "No message"}
              </p>
              <div className="border border-dashed border-border/50 bg-muted/20 px-3 py-2 mt-2">
                <p className="case-file text-[10px] tracking-[0.12em] uppercase text-muted-foreground/50 mb-0.5">
                  Archived Entry
                </p>
                <p className="noir-text text-xs text-muted-foreground/50">
                  Filed under parent branch. Open parent history to restore.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-playfair-display italic text-[17px] leading-snug text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-150">
                {commit.message || "No message"}
              </p>

              <p className="noir-text text-[13px] text-muted-foreground/60">
                {timeAgo}
              </p>
            </div>

            <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isInherited) return inner;
  return <Link href={commitHref}>{inner}</Link>;
}