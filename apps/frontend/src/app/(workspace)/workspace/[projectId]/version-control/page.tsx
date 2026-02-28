import { createSupabaseServerClient } from "@/supabase/server-client";
import { getBranchesOfProject } from "@/lib/supabase-calls/branches";
import { History, GitBranch } from "lucide-react";
import Link from "next/link";
import BranchList from "@/components/branches/branch-list";
import { Plus } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 border-b border-border bg-muted/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <History className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="mystery-title text-4xl mb-2">Case History</h1>
                <p className="text-muted-foreground noir-text">
                  Select a branch to view its commits
                </p>
              </div>
            </div>
            <Link
              href={`/workspace/${projectId}/version-control/new-branch`}
              className="bg-primary text-secondary rounded-md text-[1rem] py-2 px-3 hover:-translate-y-0.5 duration-300 noir-text inline-flex items-center font-playfair-display"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create New Branch
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
}
