import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchCommits } from "@/lib/supabase-calls/commits";
import { getBranchById } from "@/lib/supabase-calls/branches";
import { notFound } from "next/navigation";
import type { Commit } from "@detective-quill/shared-types";
import BranchCommitsHeader from "@/components/branches/branch-commits-header";
import CommitsStatsBar from "@/components/commits/commits-stats-bar";
import CommitsPaginatedList from "@/components/commits/commits-paginated-list";
import NoCommits from "@/components/commits/no-commits";

export const metadata = {
  title: "Branch Commits",
  description: "View the list of commits for a specific branch",
};

interface BranchCommitsPageProps {
  params: Promise<{ projectId: string; branchId: string }>;
}

export default async function BranchCommitsPage({
  params,
}: BranchCommitsPageProps) {
  const { projectId, branchId } = await params;
  const supabase = await createSupabaseServerClient();

  const { branch, error: branchError } = await getBranchById(branchId, supabase);
  if (branchError || !branch) notFound();

  const result = await getBranchCommits(branchId, projectId, supabase);
  const commits = result.commits as Commit[];
  const commitsError = result.error;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        <BranchCommitsHeader projectId={projectId} branch={branch} />

        {!commitsError && commits.length > 0 && (
          <CommitsStatsBar branch={branch} commitCount={commits.length} />
        )}

        <div className="pt-8 max-w-2xl">
          {commitsError ? (
            <p className="noir-text text-muted-foreground text-center py-16">
              Error loading commits: {commitsError}
            </p>
          ) : commits.length === 0 ? (
            <NoCommits />
          ) : (
            <CommitsPaginatedList
              initialCommits={commits}
              projectId={projectId}
              branchId={branchId}
            />
          )}
        </div>
      </div>
    </div>
  );
}