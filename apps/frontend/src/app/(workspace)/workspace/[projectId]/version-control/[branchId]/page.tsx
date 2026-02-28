import { createSupabaseServerClient } from "@/supabase/server-client";
import CommitsPaginatedList from "@/components/commits/commits-paginated-list";
import { getBranchCommits } from "@/lib/supabase-calls/commits";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { GitBranch } from "lucide-react";
import type { Commit } from "@detective-quill/shared-types";
import { notFound } from "next/navigation";
import BranchCommitsHeader from "@/components/branches/branch-commits-header";

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
    <div className=" min-h-screen overflow-hidden">
      <BranchCommitsHeader projectId={projectId} branch={branch} />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 px-6 -mt-8 py-8 mx-auto max-w-3xl">
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
      </div>
    </div>
  );
}
