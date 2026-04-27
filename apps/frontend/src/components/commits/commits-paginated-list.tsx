"use client";

import { useState } from "react";
import CommitCard from "./commit-card";
import CommitsPagination from "./commits-pagination";
import NoCommits from "./no-commits";
import type { Commit } from "@detective-quill/shared-types";

const PAGE_SIZE = 10;

interface CommitsPaginatedListProps {
  initialCommits: Commit[];
  projectId: string;
  branchId?: string;
}

export default function CommitsPaginatedList({
  initialCommits,
  projectId,
  branchId,
}: CommitsPaginatedListProps) {
  const [page, setPage] = useState(1);

  const total = initialCommits.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const paginatedCommits = initialCommits.slice(startIndex, endIndex);

  if (!total) return <NoCommits />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
          Commit Log
        </span>
        <div className="flex-1 border-t border-border/50" />
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
          {total} {total === 1 ? "entry" : "entries"} on record
        </span>
      </div>

      <div className="flex gap-0">
        <div className="flex flex-col items-center w-10 shrink-0 pt-1">
          <div className="w-px flex-1 bg-border/40" />
        </div>

        <ul className="flex-1 space-y-0 pb-2">
          {paginatedCommits.map((commit, index) => {
            const globalIndex = startIndex + index;
            return (
              <li key={commit.id} className="flex gap-0">
                <div className="flex flex-col items-center w-0 shrink-0 relative">
                  <div className="-translate-x-5 mt-5 w-2.5 h-2.5 rounded-full border-2 border-border/70 bg-background shrink-0 z-10" />
                </div>

                <div className="flex-1 pb-4 pl-5">
                  <p className="case-file text-[10px] text-muted-foreground/50 tracking-widest mb-1">
                    Entry #{String(globalIndex + 1).padStart(3, "0")}
                  </p>
                  <CommitCard
                    commit={commit}
                    projectId={projectId}
                    branchId={branchId}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {totalPages > 1 && (
        <CommitsPagination
          page={page}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      )}
    </div>
  );
}