import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { getSnapshotsByCommit } from "@/lib/supabase-calls/snapshots";
import { getCommitById } from "@/lib/supabase-calls/commits";
import { getActiveBranchId } from "@/lib/supabase-calls/branches";
import { buildSnapshotTree } from "@/lib/utils/snapshot-tree-utils";
import CommitSnapshotViewer from "@/components/commit-snapshot/commit-snapshot-viewer";

interface BranchCommitViewPageProps {
  params: Promise<{
    projectId: string;
    branchId: string;
    commitId: string;
  }>;
}

export default async function BranchCommitViewPage({
  params,
}: BranchCommitViewPageProps) {
  const { projectId, branchId, commitId } = await params;
  const supabase = await createSupabaseServerClient();

  const { commit, error: commitError } = await getCommitById(
    commitId,
    supabase,
  );

  if (commitError || !commit) {
    redirect(`/workspace/${projectId}/version-control/${branchId}`);
  }

  if (commit.project_id !== projectId || commit.branch_id !== branchId) {
    redirect(`/workspace/${projectId}/version-control/${branchId}`);
  }

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

  const snapshotTree = buildSnapshotTree(snapshots);
  const activeBranchId = await getActiveBranchId(projectId, supabase);

  return (
    <CommitSnapshotViewer
      commit={commit}
      snapshots={snapshotTree}
      projectId={projectId}
      branchId={branchId}
      activeBranchId={activeBranchId}
    />
  );
}
