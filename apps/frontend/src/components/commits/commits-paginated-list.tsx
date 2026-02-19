"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CommitCard from "./commit-card";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import type { Commit } from "@detective-quill/shared-types";

const PAGE_SIZE = 10;

interface CommitsPaginatedListProps {
  initialCommits: Commit[];
  projectId: string;
}

export default function CommitsPaginatedList({
  initialCommits,
  projectId,
}: CommitsPaginatedListProps) {
  const [page, setPage] = useState(1);

  const total = initialCommits.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const paginatedCommits = initialCommits.slice(startIndex, endIndex);

  if (!initialCommits.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          No commits yet. Create your first commit from the Case Files view.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {paginatedCommits.map((commit) => (
          <li key={commit.id}>
            <CommitCard commit={commit} projectId={projectId} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{endIndex} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="gap-1 cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
