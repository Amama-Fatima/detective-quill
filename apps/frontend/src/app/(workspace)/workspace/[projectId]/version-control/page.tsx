import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesWithParent } from "@/lib/supabase-calls/branches";
import VersionControlClient from "@/components/branches/version-control-client";

export const metadata = {
  title: "Manuscript History",
  description: "History page for managing branches and commits",
};

interface VersionControlPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function VersionControlPage({
  params,
}: VersionControlPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { branches, error } = await getBranchesWithParent(projectId, supabase);

  return (
    <VersionControlClient
      projectId={projectId}
      branches={branches ?? []}
      error={error}
    />
  );
}