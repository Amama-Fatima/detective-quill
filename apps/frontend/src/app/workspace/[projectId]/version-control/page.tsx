import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { History, GitBranch } from "lucide-react";
import Link from "next/link";

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
      <div className="flex items-center gap-3 mb-8">
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
        <div className="space-y-3">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              href={`/workspace/${projectId}/version-control/${branch.id}`}
              className="block rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-card/80"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {branch.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Branch ID: {branch.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {branch.is_default && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      Default
                    </span>
                  )}
                  {branch.is_active && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
