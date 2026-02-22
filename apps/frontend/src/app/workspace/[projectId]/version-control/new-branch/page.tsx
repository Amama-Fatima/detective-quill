import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateNewBranchForm from "@/components/branches/create-new-branch-form";

interface NewBranchPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function NewBranchPage({ params }: NewBranchPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();
  const { branches, error } = await getBranchesOfProject(projectId, supabase);

  if (!branches || error) {
    return (
      <div className="min-h-[60vh] px-6 py-8 max-w-2xl mx-auto">
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Unable to load branches.</p>
        </div>
      </div>
    );
  }

  const activeBranch = branches.find((branch) => branch.is_active);
  const defaultBranch = branches.find((branch) => branch.is_default);
  const baseBranch = activeBranch ?? defaultBranch ?? branches[0];
  const parentCommitId = baseBranch?.head_commit_id ?? null;

  return (
    <div className="min-h-[60vh] px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Branch</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Branching from {baseBranch?.name ?? "current branch"}
          </p>
        </div>
        <Button asChild variant="outline" className="cursor-pointer">
          <Link href={`/workspace/${projectId}/version-control`}>Back</Link>
        </Button>
      </div>

      {!parentCommitId ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No base commit found. Create a commit before branching.
          </p>
        </div>
      ) : (
        <CreateNewBranchForm
          projectId={projectId}
          parentCommitId={parentCommitId}
        />
      )}
    </div>
  );
}
