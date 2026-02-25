import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { History, GitBranch } from "lucide-react";
import Link from "next/link";
import BranchList from "@/components/branches/branch-list";

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
  const { branches, error } = await getBranchesOfProject(projectId, supabase);

  return (
    <div className="min-h-[60vh] px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Case History
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Select a branch to view its commits
            </p>
          </div>
        </div>
          <Link href={`/workspace/${projectId}/version-control/new-branch`} className="bg-primary text-secondary rounded-md text-[1rem] py-2 px-3 hover:-translate-y-0.5  duration-300">
            Create New Branch
          </Link>
      </div>

      {!projectId ? (
        <p className="text-muted-foreground text-center py-12">
          Invalid project.
        </p>
      ) : error ? (
        <p className="text-muted-foreground text-center py-12">
          Error loading branches: {error}
        </p>
      ) : !branches || branches.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No branches found for this project.
          </p>
        </div>
      ) : (
        <BranchList projectId={projectId} branches={branches} />
      )}
    </div>
  );
}
