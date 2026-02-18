import { createSupabaseServerClient } from "@/supabase/server-client";
import CommitsPaginatedList from "@/components/commits/commits-paginated-list";
import { getBranchCommits } from "@/lib/supabase-calls/commits";
import { getActiveBranchId } from "@/lib/supabase-calls/branches";
import { History, GitBranch } from "lucide-react";
import type { Commit } from "@detective-quill/shared-types";

interface VersionControlPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function VersionControlPage({
  params,
}: VersionControlPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch active branch ID on server
  const activeBranchId = await getActiveBranchId(projectId, supabase);

  // Fetch initial commits on server
  let commits: Commit[] = [];
  let commitsError = null;

  if (activeBranchId) {
    const result = await getBranchCommits(activeBranchId, projectId, supabase);
    commits = result.commits as Commit[];
    commitsError = result.error;
  }

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
            Commits for the current branch
          </p>
        </div>
      </div>

      {!projectId ? (
        <p className="text-muted-foreground text-center py-12">
          Invalid project.
        </p>
      ) : !activeBranchId ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No active branch found for this project.
          </p>
        </div>
      ) : commitsError ? (
        <p className="text-muted-foreground text-center py-12">
          Error loading commits: {commitsError}
        </p>
      ) : (
        <CommitsPaginatedList initialCommits={commits} projectId={projectId} />
      )}
    </div>
  );
}
