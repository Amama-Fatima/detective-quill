import { createSupabaseServerClient } from "@/supabase/server-client";
import type { CommitSnapshot } from "@detective-quill/shared-types";

export async function getSnapshotsByCommit(
  commitId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<{
  snapshots: CommitSnapshot[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("commit_snapshots")
    .select("*")
    .eq("commit_id", commitId)
    .order("path", { ascending: true });

  if (error) {
    return { snapshots: [], error: error.message };
  }
  console.log("Fetched snapshots for commit", commitId, data);

  return { snapshots: data || [], error: null };
}
