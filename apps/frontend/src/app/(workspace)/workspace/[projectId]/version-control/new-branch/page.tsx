import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { GitBranch } from "lucide-react";
import CreateNewBranchForm from "@/components/branches/create-new-branch-form";
import { GitBranchIcon } from "@/components/icons/mail-icon";

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
          <GitBranchIcon />
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
          <h1 className="text-2xl font-bold mystery-title tracking-tight">
            New Branch
          </h1>
          <p className="text-muted-foreground text-lg mt-0.5">
            Branching from{" "}
            <span className="text-xl font-playfair-display text-primary underline">
              {baseBranch?.name ?? "current branch"}
            </span>
          </p>
        </div>
      </div>

      {!parentCommitId ? (
        <div className="rounded-lg flex items-center justify-center gap-2 border border-dashed border-border bg-muted/30 p-12 text-center">
          <GitBranchIcon />
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
