import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { getSnapshotsByCommit } from "@/lib/supabase-calls/snapshots";
import { getCommitById } from "@/lib/supabase-calls/commits";
import { buildSnapshotTree } from "@/lib/utils/snapshot-tree-utils";
import CommitSnapshotViewer from "@/components/commit-snapshot/commit-snapshot-viewer";

interface CommitViewPageProps {
  params: Promise<{
    projectId: string;
    commitId: string;
  }>;
}

export default async function CommitViewPage({ params }: CommitViewPageProps) {
  const { projectId, commitId } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch commit details
  const { commit, error: commitError } = await getCommitById(
    commitId,
    supabase,
  );

  if (commitError || !commit) {
    redirect(`/workspace/${projectId}/version-control`);
  }

  // Fetch snapshots for this commit
  const { snapshots, error: snapshotsError } = await getSnapshotsByCommit(
    commitId,
    supabase,
  );

  if (snapshotsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Snapshot</h2>
          <p className="text-muted-foreground">{snapshotsError}</p>
        </div>
      </div>
    );
  }

  // Build tree structure from snapshots
  const snapshotTree = buildSnapshotTree(snapshots);

  return (
    <CommitSnapshotViewer
      commit={commit}
      snapshots={snapshotTree}
      projectId={projectId}
    />
  );
}
