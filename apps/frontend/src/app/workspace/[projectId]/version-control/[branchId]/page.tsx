import { createSupabaseServerClient } from "@/supabase/server-client";
import CommitsPaginatedList from "@/components/commits/commits-paginated-list";
import { getBranchCommits } from "@/lib/supabase-calls/commits";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { History, GitBranch } from "lucide-react";
import type { Commit } from "@detective-quill/shared-types";
import { notFound } from "next/navigation";

interface BranchCommitsPageProps {
  params: Promise<{
    projectId: string;
    branchId: string;
  }>;
}

export default async function BranchCommitsPage({
  params,
}: BranchCommitsPageProps) {
  const { projectId, branchId } = await params;
  const supabase = await createSupabaseServerClient();

  const { branches, error: branchesError } = await getBranchesOfProject(
    projectId,
    supabase,
  );

  if (branchesError || !branches) {
    notFound();
  }

  const branch = branches.find((item) => item.id === branchId);
  if (!branch) {
    notFound();
  }

  const result = await getBranchCommits(branchId, projectId, supabase);
  const commits = result.commits as Commit[];
  const commitsError = result.error;

  return (
    <div className="min-h-[60vh] px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <History className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Case History
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Commits for branch: {branch.name}
          </p>
        </div>
      </div>

      {commitsError ? (
        <p className="text-muted-foreground text-center py-12">
          Error loading commits: {commitsError}
        </p>
      ) : commits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No commits found for this branch.
          </p>
        </div>
      ) : (
        <CommitsPaginatedList
          initialCommits={commits}
          projectId={projectId}
          branchId={branchId}
        />
      )}
    </div>
  );
}
